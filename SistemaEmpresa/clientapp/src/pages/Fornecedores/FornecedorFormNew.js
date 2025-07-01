import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardBody, Button, FormGroup, Label, Input,
  Alert, Row, Col, Spinner, FormFeedback, Container, InputGroup, InputGroupText
} from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import CidadeSearchModal from '../Localizacao/Cidade/CidadeSearchModal';
import CondicaoPagamentoSearchModal from '../Financeiro/CondicaoPagamento/CondicaoPagamentoSearchModal';
import { useDataContext } from '../../contexts/DataContext';

// Funções de validação
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(.)\1+$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let digitoVerificador = 11 - (soma % 11);
  if (digitoVerificador > 9) digitoVerificador = 0;
  if (parseInt(cpf.charAt(9)) !== digitoVerificador) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  digitoVerificador = 11 - (soma % 11);
  if (digitoVerificador > 9) digitoVerificador = 0;
  
  return parseInt(cpf.charAt(10)) === digitoVerificador;
};

// Componente auxiliar para exibir mensagens de erro apenas quando tiver tentado enviar
const ConditionalFormFeedback = ({ field, errors, touched, attemptedSubmit }) => {
  if (attemptedSubmit && errors[field] && touched[field]) {
    return <FormFeedback>{errors[field]}</FormFeedback>;
  }
  return null;
};

const validarCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(.)\1+$/.test(cnpj)) return false;
  
  let soma = 0;
  let peso = 5;
  
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  let digitoVerificador = 11 - (soma % 11);
  if (digitoVerificador < 2) digitoVerificador = 0;
  if (parseInt(cnpj.charAt(12)) !== digitoVerificador) return false;
  
  soma = 0;
  peso = 6;
  
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  digitoVerificador = 11 - (soma % 11);
  if (digitoVerificador < 2) digitoVerificador = 0;
  
  return parseInt(cnpj.charAt(13)) === digitoVerificador;
};

// Funções de formatação
const formatarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
};

const formatarCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos
  cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
  cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
  cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
  return cnpj;
};

const formatarCEP = (cep) => {
  cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
  cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
  return cep;
};

const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  
  const valorFormatado = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return valorFormatado;
};

// Função para converter valor formatado em float
const parseMoeda = (valor) => {
  if (!valor) return 0;
  
  // Remove o símbolo da moeda e qualquer caractere não numérico exceto vírgula
  const valorNumerico = valor.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(valorNumerico) || 0;
};

const formatarTelefone = (telefone) => {
  telefone = telefone.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (telefone.length <= 10) {
    // Telefone fixo
    telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
    telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular
    telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
    telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return telefone;
};

// Schema de validação dinâmico
const createValidationSchema = (tipoPessoa) => {  const baseSchema = {
    tipoPessoa: Yup.string().required('Tipo de pessoa é obrigatório'),
    apelido: Yup.string().max(60, 'Apelido deve ter no máximo 60 caracteres').nullable(),
    email: Yup.string().email('Email inválido').nullable(),
    telefone: Yup.string().nullable(),
    contato: Yup.string().nullable(),
    endereco: Yup.string().nullable(),
    numero: Yup.string().nullable(),
    complemento: Yup.string().nullable(),
    bairro: Yup.string().nullable(),
    cep: Yup.string().nullable().transform(value => value ? value : null)
      .test('cep-valido', 'CEP inválido', value => !value || /^\d{5}-?\d{3}$/.test(value)),
    cidadeId: Yup.number().nullable().transform(value => (value && !isNaN(value)) ? Number(value) : null),
    ativo: Yup.boolean().nullable().default(true),
    observacoes: Yup.string().nullable(),
    limiteCredito: Yup.string().nullable(),
    condicaoPagamentoId: Yup.number().nullable().transform(value => (value && !isNaN(value)) ? Number(value) : null)
  };    if (tipoPessoa === 'F') {
    // Pessoa Física
    return Yup.object().shape({
      ...baseSchema,
      nome: Yup.string()
        .required('Nome é obrigatório')
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .nullable(),
      cpf: Yup.string()
        .required('CPF é obrigatório')
        .test('cpf-valido', 'CPF inválido', value => !value || validarCPF(value))
        .nullable(),
      rg: Yup.string()
        .max(14, 'RG deve ter no máximo 14 caracteres')
        .nullable(),
      // Removemos a validação do CNPJ e Razão Social completamente para pessoa física
      // para evitar mensagens de erro desnecessárias
    });
  } else {
    // Pessoa Jurídica
    return Yup.object().shape({
      ...baseSchema,
      razaoSocial: Yup.string()
        .required('Razão Social é obrigatória')
        .min(2, 'Razão Social deve ter pelo menos 2 caracteres')
        .nullable(),
      nomeFantasia: Yup.string().nullable(),
      cnpj: Yup.string()
        .required('CNPJ é obrigatório')
        .test('cnpj-valido', 'CNPJ inválido', value => !value || validarCNPJ(value))
        .nullable(),
      inscricaoEstadual: Yup.string().nullable(),
      // Campos não utilizados para pessoa jurídica - apenas nullable sem validação
      nome: Yup.string().nullable(),
      cpf: Yup.string().nullable()
    });
  }
};

const FornecedorFormNew = () => {  
  const { id } = useParams();  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);  
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [condicaoPagamentoModalOpen, setCondicaoPagamentoModalOpen] = useState(false);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState(null);
  const [tipoPessoaValue, setTipoPessoaValue] = useState('J');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);  // Usar React.useRef em vez de estado para armazenar referência ao Formik
  const formikRef = React.useRef(null);const [initialValues, setInitialValues] = useState({
    tipoPessoa: 'J',
    nome: '',
    cpf: '',
    rg: '',
    apelido: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    contato: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    observacoes: '',
    limiteCredito: 'R$ 0,00',
    condicaoPagamentoId: null,
    ativo: true
  });
  
  useEffect(() => {
    if (id) {
      carregarFornecedor();
    }
  }, [id]);
  
  // Esse efeito garante que, quando cidadeSelecionada mudar, 
  // atualizamos o campo cidadeId se tivermos acesso ao formik
  useEffect(() => {
    if (cidadeSelecionada) {
      if (formikRef.current && formikRef.current.setFieldValue) {
        formikRef.current.setFieldValue('cidadeId', cidadeSelecionada.id);
        console.log(`Atualizando cidadeId para: ${cidadeSelecionada.id} (${cidadeSelecionada.nome || 'N/A'})`);
      }
    }
  }, [cidadeSelecionada]);
  
  // Esse efeito garante que, quando condicaoPagamentoSelecionada mudar, 
  // atualizamos o campo condicaoPagamentoId se tivermos acesso ao formik
  useEffect(() => {
    if (condicaoPagamentoSelecionada) {
      if (formikRef.current && formikRef.current.setFieldValue) {
        formikRef.current.setFieldValue('condicaoPagamentoId', condicaoPagamentoSelecionada.id);
        console.log(`Atualizando condicaoPagamentoId para: ${condicaoPagamentoSelecionada.id} (${condicaoPagamentoSelecionada.descricao || 'N/A'})`);
      }
    }
  }, [condicaoPagamentoSelecionada]);
  
  const carregarFornecedor = async () => {
    setInitialLoading(true);
    try {
      console.log('Carregando fornecedor com ID:', id);
      const response = await apiClient.get(`/Fornecedor/${id}`);
      console.log('Dados completos do fornecedor carregados:', response.data);
      const fornecedor = response.data;
      
      // Verifica se é uma pessoa física baseado no tipo de pessoa ou no prefixo [PF] na razão social
      const isPessoaFisica = fornecedor.tipoPessoa === 'F' || (fornecedor.razaoSocial && fornecedor.razaoSocial.startsWith('[PF]'));
      
      let tipoPessoa = isPessoaFisica ? 'F' : 'J';
      let nome = '';
      let razaoSocial = fornecedor.razaoSocial || '';
      
      if (isPessoaFisica) {
        // Remove o prefixo [PF] para exibir apenas o nome
        nome = razaoSocial.replace('[PF] ', '') || '';
        console.log('Fornecedor identificado como pessoa física:', nome);
      }
      
      setInitialValues({
        tipoPessoa: tipoPessoa,        nome: nome,
        cpf: fornecedor.cpf ? formatarCPF(fornecedor.cpf) : '',
        rg: fornecedor.rg || '',
        apelido: fornecedor.apelido || '',
        razaoSocial: isPessoaFisica ? '' : razaoSocial,
        nomeFantasia: fornecedor.nomeFantasia || '',
        cnpj: fornecedor.cnpj ? formatarCNPJ(fornecedor.cnpj) : '',
        inscricaoEstadual: fornecedor.inscricaoEstadual || '',
        email: fornecedor.email || '',
        telefone: fornecedor.telefone ? formatarTelefone(fornecedor.telefone) : '',
        contato: fornecedor.contato ? formatarTelefone(fornecedor.contato) : '',
        endereco: fornecedor.endereco || '',
        numero: fornecedor.numero || '',
        complemento: fornecedor.complemento || '',
        bairro: fornecedor.bairro || '',
        cep: fornecedor.cep ? formatarCEP(fornecedor.cep) : '',
        cidadeId: fornecedor.cidadeId || '',
        observacoes: fornecedor.observacao || '',
        limiteCredito: fornecedor.limiteCredito ? formatarMoeda(fornecedor.limiteCredito) : 'R$ 0,00',
        condicaoPagamentoId: fornecedor.condicaoPagamentoId || null,
        ativo: fornecedor.ativo !== false      });
      
      setTipoPessoaValue(tipoPessoa);
      
      if (fornecedor.cidade) {
        setCidadeSelecionada(fornecedor.cidade);
      }

      if (fornecedor.condicaoPagamento) {
        setCondicaoPagamentoSelecionada(fornecedor.condicaoPagamento);
      } else if (fornecedor.condicaoPagamentoId) {
        try {
          const condicaoResponse = await apiClient.get(`/CondicaoPagamento/${fornecedor.condicaoPagamentoId}`);
          setCondicaoPagamentoSelecionada(condicaoResponse.data);
        } catch (err) {
          console.error('Erro ao carregar condição de pagamento:', err);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedor:', error);
      setSubmitError('Erro ao carregar os dados do fornecedor.');
    } finally {
      setInitialLoading(false);
    }
  };
    const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Iniciando submit do formulário. ID fornecedor:', id);
    try {
      setAttemptedSubmit(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      // Verificando o tipo de pessoa
      const tipoPessoa = values.tipoPessoa;
      
      // Criando o objeto para envio
      const dadosParaEnvio = {
        Id: id ? parseInt(id) : 0, // Importante para atualização
        // Campos comuns
        Email: values.email || null,
        Telefone: values.telefone ? values.telefone.replace(/[^\d]/g, '') : null,
        Endereco: values.endereco || null,
        Numero: values.numero || null,
        Complemento: values.complemento || null,
        Bairro: values.bairro || null,
        CEP: values.cep ? values.cep.replace(/[^\d]/g, '') : null,
        CidadeId: values.cidadeId ? parseInt(values.cidadeId) : null,
        Ativo: values.ativo === true,
        // Adicionamos o campo TipoPessoa mesmo que não seja usado diretamente no modelo
        TipoPessoa: tipoPessoa,        // Campos adicionais
        Contato: values.contato ? values.contato.replace(/[^\d]/g, '') : null,
        Apelido: values.apelido || null,
        Observacao: values.observacoes || null,
        LimiteCredito: parseMoeda(values.limiteCredito),
        CondicaoPagamentoId: values.condicaoPagamentoId ? parseInt(values.condicaoPagamentoId) : null
      };
        // Dependendo do tipo de pessoa
      if (tipoPessoa === 'F') {
        console.log("Preparando envio de dados de pessoa física");
        
        // Para pessoa física, enviamos apenas os campos relevantes        dadosParaEnvio.TipoPessoa = 'F'; // Garantir que o tipo de pessoa seja F
        dadosParaEnvio.Nome = values.nome;
        dadosParaEnvio.CPF = values.cpf ? values.cpf.replace(/[^\d]/g, '') : null;
        dadosParaEnvio.RG = values.rg || null;
        
        // A razão social é obrigatória no backend, então usamos o nome com um prefixo
        dadosParaEnvio.RazaoSocial = `[PF] ${values.nome}`;
        dadosParaEnvio.NomeFantasia = `[PF] ${values.nome}`;
        
        // Para pessoa física, esses campos são isentos no backend
        dadosParaEnvio.CNPJ = "ISENTO";
        dadosParaEnvio.InscricaoEstadual = "ISENTO";
        
        console.log("Dados formatados para pessoa física:", {
          Nome: dadosParaEnvio.Nome,
          CPF: dadosParaEnvio.CPF,
          TipoPessoa: dadosParaEnvio.TipoPessoa,
          RazaoSocial: dadosParaEnvio.RazaoSocial,
          CNPJ: dadosParaEnvio.CNPJ
        });
      } else {
        console.log("Preparando envio de dados de pessoa jurídica");
        
        // Garantir que o tipo de pessoa seja J
        dadosParaEnvio.TipoPessoa = 'J';
        
        // Para pessoa jurídica, campos normais
        dadosParaEnvio.RazaoSocial = values.razaoSocial;
        dadosParaEnvio.NomeFantasia = values.nomeFantasia;
        dadosParaEnvio.CNPJ = values.cnpj ? values.cnpj.replace(/[^\d]/g, '') : null;
        dadosParaEnvio.InscricaoEstadual = values.inscricaoEstadual || "ISENTO";
        dadosParaEnvio.Nome = values.razaoSocial; // Garantir que o campo Nome esteja preenchido para satisfazer validações
        
        // Valores padrão para campos obrigatórios de pessoa física 
        // para evitar erros de validação no backend
        dadosParaEnvio.CPF = null;
      }
      
      // Log detalhado dos dados antes do envio
      console.log('Dados completos formatados para envio:', JSON.stringify(dadosParaEnvio, null, 2));
      
      // Verificação final para garantir que os campos corretos estão sendo enviados
      if (tipoPessoa === 'F') {
        // Validar campos obrigatórios específicos para pessoa física
        if (!dadosParaEnvio.Nome || !dadosParaEnvio.CPF) {
          console.error('Campos obrigatórios de pessoa física não preenchidos');
          setSubmitError('Por favor, preencha o Nome e CPF da pessoa física.');
          setSubmitting(false);
          return;
        }
      } else {
        // Validar campos obrigatórios específicos para pessoa jurídica
        if (!dadosParaEnvio.RazaoSocial || !dadosParaEnvio.CNPJ) {
          console.error('Campos obrigatórios de pessoa jurídica não preenchidos');
          setSubmitError('Por favor, preencha a Razão Social e CNPJ da pessoa jurídica.');
          setSubmitting(false);
          return;
        }
      }
      
      try {
        if (id) {
          console.log(`Enviando solicitação PUT para /Fornecedor/${id}`);
          console.log('Dados completos para PUT:', JSON.stringify(dadosParaEnvio, null, 2));
          
          // Garantir que os dados estão no formato correto
          Object.keys(dadosParaEnvio).forEach(key => {
            const value = dadosParaEnvio[key];
            console.log(`Campo ${key}: ${value} (${typeof value})`);
          });
          
          const response = await apiClient.put(`/Fornecedor/${id}`, dadosParaEnvio);
          console.log('Fornecedor atualizado com sucesso:', response.data);
        } else {
          console.log('Enviando solicitação POST para /Fornecedor');
          console.log('Dados completos para POST:', JSON.stringify(dadosParaEnvio, null, 2));
          const response = await apiClient.post('/Fornecedor', dadosParaEnvio);
          console.log('Fornecedor criado com sucesso:', response.data);
        }
        
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/fornecedores');
        }, 1500);
      } catch (error) {
        console.error('Erro ao salvar fornecedor:', error);
        
        // Extrair a mensagem de erro do objeto response
        let errorMessage = 'Erro ao salvar fornecedor. Verifique os dados e tente novamente.';
        
        if (error.response && error.response.data) {
          // Tentar obter a mensagem do erro
          if (error.response.data.mensagem) {
            errorMessage = error.response.data.mensagem;
          } else if (error.response.data.Message) {
            errorMessage = error.response.data.Message;
          } else if (error.response.data.erro) {
            errorMessage = error.response.data.erro;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        
        console.log('Mensagem de erro formatada:', errorMessage);
        setSubmitError(errorMessage);
      }
    } catch (mainError) {
      console.error('Erro no fluxo principal do handleSubmit:', mainError);
      setSubmitError('Erro ao processar o formulário: ' + (mainError.message || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCidadeSelecionada = (cidade, setFieldValue) => {
    setCidadeSelecionada(cidade);
    if (setFieldValue) {
      setFieldValue('cidadeId', cidade.id);
    }
    setCidadeModalOpen(false);
  };

  if (initialLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <Card className="border-0">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
              {id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h4>
            {/* Botão Voltar removido, pois já existe o botão Cancelar no rodapé */}
          </div>                  {submitError && attemptedSubmit && (
            <Alert color="danger">
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              {
                // Para pessoa física, não mostrar o erro padrão de formulário
                formikRef.current?.values?.tipoPessoa === 'F' && submitError === 'Por favor, corrija os erros no formulário antes de enviar.' ? 
                'Por favor, verifique os campos destacados e tente novamente.' : 
                submitError
              }              {/* Exibir erros específicos apenas após tentativa de envio */}
              {attemptedSubmit && Object.keys(formikRef.current?.errors || {}).length > 0 && (
                <div className="mt-2">
                  <small>Problemas encontrados:</small>
                  <ul className="mb-0 mt-1">
                    {Object.keys(formikRef.current?.errors || {})
                      // Remover razaoSocial e cnpj da lista de erros para pessoa física
                      .filter(field => {
                        if (formikRef.current?.values?.tipoPessoa === 'F') {
                          return !['razaoSocial', 'cnpj', 'inscricaoEstadual', 'nomeFantasia'].includes(field);
                        }
                        return true;
                      })
                      .map(field => (
                        <li key={field}>{field}: {formikRef.current?.errors[field]}</li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {submitSuccess && (
            <Alert color="success">
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Fornecedor salvo com sucesso!
            </Alert>
          )}                  <Formik
            initialValues={initialValues}
            validationSchema={createValidationSchema(tipoPessoaValue)}
            enableReinitialize={true}
            onSubmit={handleSubmit}
            innerRef={formikRef}
          >
            {(formikProps) => {
              const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
              const showError = (field) => attemptedSubmit && errors[field] && touched[field];
              
              // Log de informações úteis para debug
              console.log('Formik renderizando valores:', Object.keys(values).length);
              
              return (
                <Form>
                {/* Tipo de Pessoa */}
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="tipoPessoa">Tipo de Pessoa <span className="text-danger">*</span></Label>
                      <div>                            <FormGroup check inline>                          <Input
                            type="radio"
                            name="tipoPessoa"
                            id="tipoPessoaF"
                            value="F"
                            checked={values.tipoPessoa === 'F'}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              console.log("Alterando para Pessoa Física");                              setFieldValue('tipoPessoa', newValue);
                              setTipoPessoaValue(newValue);
                              
                              // Limpar campos de pessoa jurídica quando mudar para física
                              if (newValue === 'F') {
                                setFieldValue('razaoSocial', '');
                                setFieldValue('nomeFantasia', '');
                                setFieldValue('cnpj', 'ISENTO');
                                setFieldValue('inscricaoEstadual', 'ISENTO');
                                console.log("Campos de PJ limpos e CNPJ/Inscrição Estadual definidos como ISENTO");
                              }
                            }}
                          />
                          <Label check for="tipoPessoaF">Pessoa Física</Label>
                        </FormGroup>
                        <FormGroup check inline>                          <Input
                            type="radio"
                            name="tipoPessoa"
                            id="tipoPessoaJ"
                            value="J"
                            checked={values.tipoPessoa === 'J'}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              console.log("Alterando para Pessoa Jurídica");
                              setFieldValue('tipoPessoa', newValue);
                              setTipoPessoaValue(newValue);
                              
                              // Limpar campos de pessoa física quando mudar para jurídica
                              if (newValue === 'J') {
                                setFieldValue('nome', '');
                                setFieldValue('cpf', '');
                                setFieldValue('cnpj', '');  // Limpar CNPJ para que usuário preencha
                                console.log("Campos de PF limpos, aguardando preenchimento de CNPJ");
                              }
                            }}
                          />
                          <Label check for="tipoPessoaJ">Pessoa Jurídica</Label>
                        </FormGroup>
                      </div>                      {attemptedSubmit && errors.tipoPessoa && touched.tipoPessoa && (
                        <FormFeedback style={{ display: 'block' }}>
                          {errors.tipoPessoa}
                        </FormFeedback>
                      )}<small className="text-muted mt-2 d-block">
                        {values.tipoPessoa === 'F' 
                          ? 'Para pessoa física, preencha apenas Nome e CPF. Os campos CNPJ e Inscrição Estadual serão definidos como ISENTO automaticamente.' 
                          : 'Para pessoa jurídica, preencha Razão Social e CNPJ.'}
                      </small>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Campos específicos por tipo de pessoa */}
                {values.tipoPessoa === 'F' ? (
                  // Pessoa Física
                  <>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="nome">Fornecedor <span className="text-danger">*</span></Label>                        <Field name="nome">
                          {({ field, meta }) => (
                            <Input
                              {...field}
                              type="text"
                              id="nome"
                              invalid={showError('nome')}
                              placeholder="Nome completo"
                            />
                          )}
                        </Field>                        <ConditionalFormFeedback 
                          field="nome" 
                          errors={errors} 
                          touched={touched} 
                          attemptedSubmit={attemptedSubmit} 
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="cpf">CPF <span className="text-danger">*</span></Label>
                        <Input
                          type="text"
                          id="cpf"
                          value={values.cpf}
                          onChange={(e) => {
                            const formatted = formatarCPF(e.target.value);
                            if (formatted.replace(/[^\d]/g, '').length <= 11) {
                              setFieldValue('cpf', formatted);
                            }
                          }}                          invalid={showError('cpf')}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />                        <ConditionalFormFeedback 
                          field="cpf" 
                          errors={errors} 
                          touched={touched} 
                          attemptedSubmit={attemptedSubmit} 
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="rg">RG</Label>
                        <Field name="rg">
                          {({ field, meta }) => (
                            <Input
                              {...field}
                              type="text"
                              id="rg"                              invalid={attemptedSubmit && meta.error && meta.touched}
                              placeholder="RG"
                            />
                          )}
                        </Field>                        <ConditionalFormFeedback 
                          field="rg" 
                          errors={errors} 
                          touched={touched} 
                          attemptedSubmit={attemptedSubmit} 
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="apelido">Apelido</Label>
                        <Field name="apelido">
                          {({ field, meta }) => (
                            <Input
                              {...field}
                              type="text"
                              id="apelido"
                              invalid={meta.error && meta.touched}
                              placeholder="Apelido"
                            />
                          )}
                        </Field>
                        {errors.apelido && touched.apelido && (
                          <FormFeedback>{errors.apelido}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  {/* Campo CNPJ removido para pessoa física */}
                  </>
                ) : (
                  // Pessoa Jurídica
                  <>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="razaoSocial">Fornecedor <span className="text-danger">*</span></Label>
                          <Field name="razaoSocial">
                            {({ field, meta }) => (
                              <Input
                                {...field}
                                type="text"
                                id="razaoSocial"
                                invalid={meta.error && meta.touched}
                                placeholder="Razão social da empresa"
                              />
                            )}
                          </Field>                          <ConditionalFormFeedback 
                            field="razaoSocial" 
                            errors={errors} 
                            touched={touched} 
                            attemptedSubmit={attemptedSubmit} 
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="nomeFantasia">Nome Fantasia</Label>
                          <Field name="nomeFantasia">
                            {({ field }) => (
                              <Input
                                {...field}
                                type="text"
                                id="nomeFantasia"
                                placeholder="Nome fantasia"
                              />
                            )}
                          </Field>
                        </FormGroup>
                      </Col>
                    </Row>                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="cnpj">CNPJ <span className="text-danger">*</span></Label>
                          <Input
                            type="text"
                            id="cnpj"
                            value={values.cnpj}
                            onChange={(e) => {
                              const formatted = formatarCNPJ(e.target.value);
                              if (formatted.replace(/[^\d]/g, '').length <= 14) {
                                setFieldValue('cnpj', formatted);
                              }
                            }}                            invalid={showError('cnpj')}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                          />                          <ConditionalFormFeedback 
                            field="cnpj" 
                            errors={errors} 
                            touched={touched} 
                            attemptedSubmit={attemptedSubmit} 
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="inscricaoEstadual">Inscrição Estadual</Label>
                          <Field name="inscricaoEstadual">
                            {({ field }) => (
                              <Input
                                {...field}
                                type="text"
                                id="inscricaoEstadual"
                                placeholder="Inscrição estadual"
                              />
                            )}
                          </Field>
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="apelido">Apelido</Label>
                          <Field name="apelido">
                            {({ field, meta }) => (
                              <Input
                                {...field}
                                type="text"
                                id="apelido"
                                invalid={meta.error && meta.touched}
                                placeholder="Apelido"
                              />
                            )}
                          </Field>
                          {errors.apelido && touched.apelido && (
                            <FormFeedback>{errors.apelido}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                )}                {/* Dados de Contato */}
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="email">Email</Label>
                      <Field name="email">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="email"
                            id="email"
                            invalid={meta.error && meta.touched}
                            placeholder="email@exemplo.com"
                          />
                        )}
                      </Field>                      <ConditionalFormFeedback 
                        field="email" 
                        errors={errors} 
                        touched={touched} 
                        attemptedSubmit={attemptedSubmit} 
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>                        <FormGroup>
                      <Label for="telefone">Telefone</Label>
                      <Input
                        type="text"
                        id="telefone"
                        value={values.telefone}
                        onChange={(e) => {
                          const formatted = formatarTelefone(e.target.value);
                          if (formatted.replace(/[^\d]/g, '').length <= 11) {
                            setFieldValue('telefone', formatted);
                          }
                        }}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Campo de contato */}
                <Row>
                  <Col md={12}>
                    <FormGroup>                          <Label for="contato">Contato</Label>
                      <Input
                        type="text"
                        id="contato"
                        name="contato"
                        value={values.contato}
                        onChange={(e) => {
                          const formatted = formatarTelefone(e.target.value);
                          if (formatted.replace(/[^\d]/g, '').length <= 11) {
                            setFieldValue('contato', formatted);
                          }
                        }}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                {/* Informações Financeiras */}
                <Row className="mt-3">
                  <Col md={12}>
                    <h5 className="text-primary mb-3">Informações Financeiras</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="limiteCredito">Limite de Crédito</Label>
                      <InputGroup>
                        <InputGroupText style={{ background: '#0d6efd', color: 'white', border: 'none', fontWeight: 500 }}>R$</InputGroupText>
                        <Input
                          type="text"
                          id="limiteCredito"
                          name="limiteCredito"
                          value={values.limiteCredito}
                          onChange={(e) => {
                            const apenasNumeros = e.target.value.replace(/\D/g, '');
                            if (apenasNumeros) {
                              const valorDecimal = parseFloat(apenasNumeros) / 100;
                              const valorFormatado = formatarMoeda(valorDecimal);
                              setFieldValue('limiteCredito', valorFormatado);
                            } else {
                              setFieldValue('limiteCredito', 'R$ 0,00');
                            }
                          }}
                          invalid={attemptedSubmit && errors.limiteCredito && touched.limiteCredito}
                          placeholder="0,00"
                        />
                      </InputGroup>
                      <ConditionalFormFeedback 
                        field="limiteCredito" 
                        errors={errors} 
                        touched={touched} 
                        attemptedSubmit={attemptedSubmit} 
                      />
                    </FormGroup>
                  </Col>                </Row>

                {/* Condição de Pagamento */}
                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup>
                      <Label for="condicaoPagamento">Condição de Pagamento</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flexGrow: 1 }}>
                          <Input
                            type="text"
                            readOnly
                            value={
                              condicaoPagamentoSelecionada ? 
                                `${condicaoPagamentoSelecionada.descricao} (${condicaoPagamentoSelecionada.numeroParcelas}x)` 
                              : ''
                            }
                            placeholder="Selecione uma condição de pagamento"
                            invalid={attemptedSubmit && errors.condicaoPagamentoId && touched.condicaoPagamentoId}
                          />
                          <Input
                            type="hidden"
                            name="condicaoPagamentoId"
                            id="condicaoPagamentoId"
                            value={values.condicaoPagamentoId || ''}
                          />
                        </div>
                        <Button
                          type="button"
                          color="outline-primary"
                          className="ms-2"
                          onClick={() => setCondicaoPagamentoModalOpen(true)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>                      {attemptedSubmit && errors.condicaoPagamentoId && touched.condicaoPagamentoId && (
                        <FormFeedback style={{ display: 'block' }}>
                          {errors.condicaoPagamentoId}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                {/* Informações de Endereço */}
                <Row className="mt-3">
                  <Col md={12}>
                    <h5 className="text-primary mb-3">Informações de Endereço</h5>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={8}>
                    <FormGroup>
                      <Label for="endereco">Endereço</Label>
                      <Field name="endereco">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            id="endereco"
                            placeholder="Logradouro"
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="numero">Número</Label>
                      <Field name="numero">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            id="numero"
                            placeholder="Número"
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="complemento">Complemento</Label>
                      <Field name="complemento">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            id="complemento"
                            placeholder="Complemento"
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="bairro">Bairro</Label>
                      <Field name="bairro">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            id="bairro"
                            placeholder="Bairro"
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="cep">CEP</Label>
                      <Input
                        type="text"
                        id="cep"
                        value={values.cep}
                        onChange={(e) => {
                          const formatted = formatarCEP(e.target.value);
                          if (formatted.replace(/[^\d]/g, '').length <= 8) {
                            setFieldValue('cep', formatted);
                          }
                        }}
                        invalid={attemptedSubmit && errors.cep && touched.cep}
                        placeholder="00000-000"
                        maxLength={9}
                      />                      <ConditionalFormFeedback 
                        field="cep" 
                        errors={errors} 
                        touched={touched} 
                        attemptedSubmit={attemptedSubmit} 
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Cidade */}
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="cidade">Cidade</Label>
                      <div className="d-flex">                            <Input
                          type="text"
                          readOnly
                          value={
                            cidadeSelecionada ? 
                              `${cidadeSelecionada.nome} - ${
                                cidadeSelecionada.estado?.nome || 
                                cidadeSelecionada.estadoNome || 
                                ''} ${
                                cidadeSelecionada.estado?.sigla 
                                  ? '(' + cidadeSelecionada.estado.sigla + ')' 
                                  : cidadeSelecionada.estadoUf 
                                    ? '(' + cidadeSelecionada.estadoUf + ')' 
                                    : ''
                              }` 
                            : ''
                          }
                          placeholder="Selecione uma cidade"
                          invalid={attemptedSubmit && errors.cidadeId && touched.cidadeId}
                        />
                        <Button
                          type="button"
                          color="outline-primary"
                          className="ms-2"
                          onClick={() => setCidadeModalOpen(true)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>                      {attemptedSubmit && errors.cidadeId && touched.cidadeId && (
                        <FormFeedback style={{ display: 'block' }}>
                          {errors.cidadeId}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>                {/* Seção de Observações */}
                <Row className="mt-3">
                  <Col md={12}>
                    <h5 className="text-primary mb-3">Observações</h5>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Field name="observacoes">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="textarea"
                            id="observacoes"
                            rows={4}
                            placeholder="Adicione observações sobre o fornecedor"
                            style={{ minHeight: '100px' }}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Status */}
                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup check className="mb-4 mt-2">
                      <div className="form-check form-switch">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="ativo"
                          role="switch"
                          name="ativo"
                          checked={values.ativo}
                          onChange={(e) => setFieldValue('ativo', e.target.checked)}
                        />
                        <Label className="form-check-label" for="ativo">
                          <strong>Ativo</strong> {values.ativo ? 
                            <span className="text-success">(Registro Ativo)</span> : 
                            <span className="text-danger">(Registro Inativo)</span>}
                        </Label>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                {/* Botões */}
                <div className="d-flex justify-content-end gap-2 mt-4">                      <Button
                    type="button"
                    color="primary"
                    disabled={isSubmitting}
                    className="me-2"                    onClick={() => {
                      console.log('Botão Atualizar/Salvar clicado manualmente');
                      
                      // Indicar que o usuário tentou enviar o formulário
                      setAttemptedSubmit(true);
                      
                      // Marcar campos relevantes como tocados para mostrar erros
                      if (values.tipoPessoa === 'F') {
                        // Para pessoa física, validar apenas os campos relevantes
                        ['nome', 'cpf', 'email', 'telefone', 'cidadeId'].forEach(field => {
                          formikRef.current?.setFieldTouched(field, true, true);
                        });
                      } else {
                        // Para pessoa jurídica, validar apenas os campos relevantes
                        ['razaoSocial', 'cnpj', 'email', 'telefone', 'cidadeId'].forEach(field => {
                          formikRef.current?.setFieldTouched(field, true, true);
                        });
                      }
                      
                      // Verificar erros no tipo de pessoa atual
                      const relevantErrors = {};
                      if (values.tipoPessoa === 'F') {
                        // Para pessoa física, verificar apenas erros nos campos relevantes
                        ['tipoPessoa', 'nome', 'cpf', 'email', 'telefone', 'cidadeId'].forEach(field => {
                          if (errors[field]) relevantErrors[field] = errors[field];
                        });
                      } else {
                        // Para pessoa jurídica, verificar apenas erros nos campos relevantes
                        ['tipoPessoa', 'razaoSocial', 'cnpj', 'email', 'telefone', 'cidadeId'].forEach(field => {
                          if (errors[field]) relevantErrors[field] = errors[field];
                        });
                      }
                      
                      if (Object.keys(relevantErrors).length > 0) {
                        console.log('Formulário tem erros relevantes, não pode ser enviado:', relevantErrors);
                        
                        // Mostrar mensagem de erro específica para o tipo de pessoa
                        if (values.tipoPessoa === 'F') {
                          setSubmitError('Por favor, corrija os erros no formulário de Pessoa Física antes de enviar.');
                        } else {
                          setSubmitError('Por favor, corrija os erros no formulário de Pessoa Jurídica antes de enviar.');
                        }
                        
                        return; // Impedir envio
                      }
                      
                      // Se não há erros relevantes, tentar enviar o formulário
                      console.log('Nenhum erro relevante encontrado, enviando formulário');
                      formikRef.current?.handleSubmit();
                    }}
                  >
                    {isSubmitting ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                    )}
                    {id ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => navigate('/fornecedores')}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancelar
                  </Button>
                </div>
              </Form>
            );
          }}
          </Formik>
        </CardBody>
      </Card>
      
      {/* Modal de seleção de cidade */}          <CidadeSearchModal
        isOpen={cidadeModalOpen}
        toggle={() => setCidadeModalOpen(!cidadeModalOpen)}
        onSelect={async (cidade) => {
          try {
            // Buscar a cidade completa com informações detalhadas
            if (cidade && cidade.id) {
              let cidadeResponse;
              try {
                // Buscar a cidade completa com informações detalhadas
                cidadeResponse = await apiClient.get(`/Cidade/${cidade.id}`);
                const cidadeCompleta = cidadeResponse.data;
                console.log("Cidade selecionada:", cidadeCompleta.nome);
                setCidadeSelecionada(cidadeCompleta);
              } catch (importError) {
                console.error("Não foi possível obter detalhes da cidade:", importError.message);
                
                // Se não puder importar o serviço, tentar buscar a cidade diretamente pela API
                try {
                  const response = await apiClient.get(`/Cidade/${cidade.id}?expand=estado`);
                  setCidadeSelecionada(response.data);
                  console.log("Cidade obtida via API alternativa:", response.data.nome);
                } catch (apiError) {
                  console.error("Erro ao buscar cidade:", apiError.message);
                  setCidadeSelecionada(cidade);
                }
              }
            } else {
              setCidadeSelecionada(cidade);
            }
            setCidadeModalOpen(false);
            // O useEffect acima vai cuidar de atualizar via formikRef
          } catch (error) {            console.error("Erro ao buscar detalhes da cidade:", error);
            setCidadeSelecionada(cidade);
            setCidadeModalOpen(false);
          }        }}
        renderButton={false} /* Desabilitar botão flutuante */
      />

      {/* Modal de seleção de condição de pagamento */}
      <CondicaoPagamentoSearchModal
        isOpen={condicaoPagamentoModalOpen}
        toggle={() => setCondicaoPagamentoModalOpen(!condicaoPagamentoModalOpen)}
        onSelect={(condicao) => {
          setCondicaoPagamentoSelecionada(condicao);
          setCondicaoPagamentoModalOpen(false);
        }}
        renderButton={false} /* Desabilitar botão flutuante */
      />
    </Container>
  );
};

export default FornecedorFormNew;
