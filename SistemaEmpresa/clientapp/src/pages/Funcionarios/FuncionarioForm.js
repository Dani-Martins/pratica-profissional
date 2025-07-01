import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardBody, Button, FormGroup, Label, Input,
  Alert, Row, Col, Spinner, FormFeedback, Container,
  InputGroup, InputGroupText
} from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faTimes, faArrowLeft, faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { handleUpperCaseChange } from '../../utils/uppercaseTransformer';
import { 
  formatarCPF, 
  formatarCEP, 
  formatarTelefone, 
  formatarMoeda,
  converterMoedaParaNumero
} from '../../utils/formatadores';
import { markFormikFields } from '../../utils/uppercaseTransformer';
import CidadeSearchModal from '../Localizacao/Cidade/CidadeSearchModal';
import EstadoSearchModal from '../Localizacao/Estado/EstadoSearchModal';
import PaisSearchModal from '../Localizacao/Pais/PaisSearchModal';
import FuncaoFuncionarioSearchModal from './Funcao/FuncaoFuncionarioSearchModal';
import SearchButton from '../../components/buttons/SearchButton';
import './FuncionarioForm.css';

// CSS adicional para os cabeçalhos das seções
const sectionHeaderStyle = {
  paddingBottom: '10px',
  borderBottom: '1px solid #eee',
  fontWeight: '500'
};

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

// Schema de validação para funcionário
const createValidationSchema = () => {      // Schema para funcionário (pessoa física)
  return Yup.object().shape({
    funcaoFuncionarioId: Yup.number().required('Função de Funcionário é obrigatória'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    endereco: Yup.string().required('Endereço é obrigatório'),
    numero: Yup.string().required('Número é obrigatório'),
    bairro: Yup.string().required('Bairro é obrigatório'),
    cidadeId: Yup.mixed().required('Cidade é obrigatória'),
    // Validações para campos de pessoa física
    nome: Yup.string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .test('nome-vazio', 'Nome não pode estar vazio', value => 
        value && value.trim().length > 0
      )
      .test('nome-espacos', 'Nome não pode conter apenas espaços', value =>
        !value || value.trim().length > 0
      ),
    cpf: Yup.string()
      .required('CPF é obrigatório')
      .test('cpf-valido', 'CPF inválido', validarCPF),
    // Validação do salário
    salario: Yup.string()
      .test('salario-valido', 'Formato de salário inválido', value => {
        if (!value) return true; // Será tratado para ser 0,00
        return /^[0-9,.]+$/.test(value);
      }),
    // Validações para novos campos
    apelido: Yup.string().max(60, 'Apelido deve ter no máximo 60 caracteres'),
    cnh: Yup.string(),
    observacoes: Yup.string().max(255, 'Observações deve ter no máximo 255 caracteres')
  });
};

const FuncionarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const formikRef = React.useRef(null);
  const formRef = useRef(null);
  
  // Efeito para marcar os campos do Formik para evitar conflitos com o uppercaseTransformer
  useEffect(() => {
    if (formRef.current) {
      markFormikFields(formRef.current);
    }
  }, []);
  
  const [initialValues, setInitialValues] = useState({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    funcaoFuncionarioId: '',
    funcaoFuncionarioNome: '',
    dataAdmissao: '',
    dataDemissao: '',
    salario: '0,00',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    observacoes: '',
    ativo: true,
    // Campos adicionais
    apelido: '',
    cnh: '',
    dataValidadeCNH: '',
    sexo: '',
    estadoCivil: '',
    isBrasileiro: 1,
    nacionalidade: 1 // Valor numérico para Brasileiro
  });
  
  // Estado para controle de modais de localização
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [paisSelecionado, setPaisSelecionado] = useState(null);
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [estadoModalOpen, setEstadoModalOpen] = useState(false);
  const [paisModalOpen, setPaisModalOpen] = useState(false);
  const [funcaoModalOpen, setFuncaoModalOpen] = useState(false);
  
  // Estado para controle de validação de CNH
  const [funcaoSelecionada, setFuncaoSelecionada] = useState(null);
  const [cnhError, setCnhError] = useState(null);
  
  // Efeito para carregar detalhes da função quando funcaoFuncionarioId mudar
  useEffect(() => {
    if (formikRef.current?.values.funcaoFuncionarioId) {
      const carregarDetalhesFuncao = async () => {
        try {
          const response = await axios.get(`/api/FuncaoFuncionario/${formikRef.current.values.funcaoFuncionarioId}`);
          setFuncaoSelecionada(response.data);
          
          // Verificar se a função requer CNH e se o funcionário tem CNH compatível
          if (response.data.requerCNH && response.data.tipoCNHRequerido) {
            const cnhFuncionario = formikRef.current.values.cnh;
            const cnhRequerida = response.data.tipoCNHRequerido;
            
            if (cnhFuncionario && !verificarCompatibilidadeCNH(cnhFuncionario, cnhRequerida)) {
              setCnhError(`A função requer CNH categoria ${cnhRequerida}. A CNH categoria ${cnhFuncionario} não é compatível.`);
            } else if (!cnhFuncionario) {
              setCnhError(`A função requer CNH categoria ${cnhRequerida}. Por favor, informe a CNH do funcionário.`);
            } else {
              setCnhError(null);
            }
          } else {
            setCnhError(null);
          }
        } catch (err) {
          console.error('Erro ao carregar detalhes da função:', err);
        }
      };
      
      carregarDetalhesFuncao();
    }
  }, [formikRef.current?.values.funcaoFuncionarioId, formikRef.current?.values.cnh]);

  useEffect(() => {
    // Carregar dados do funcionário para edição
    if (id) {
      carregarFuncionario();
    }
  }, [id]);

  const carregarFuncionario = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get(`/api/Funcionario/${id}`);
      const funcionarioData = response.data;
      
      setInitialValues({
        nome: funcionarioData.nome || '',
        cpf: funcionarioData.cpf ? formatarCPF(funcionarioData.cpf) : '',
        rg: funcionarioData.rg || '',
        dataNascimento: funcionarioData.dataNascimento ? funcionarioData.dataNascimento.substring(0, 10) : '',
        email: funcionarioData.email || '',
        telefone: funcionarioData.telefone ? formatarTelefone(funcionarioData.telefone) : '',
        funcaoFuncionarioId: funcionarioData.funcaoFuncionarioId || '',
        funcaoFuncionarioNome: funcionarioData.funcaoFuncionario?.funcaoFuncionarioNome || '',
        dataAdmissao: funcionarioData.dataAdmissao ? funcionarioData.dataAdmissao.substring(0, 10) : '',
        dataDemissao: funcionarioData.dataDemissao ? funcionarioData.dataDemissao.substring(0, 10) : '',
        salario: funcionarioData.salario !== null && funcionarioData.salario !== undefined ? 
          Number(funcionarioData.salario).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : 
          '0,00',
        endereco: funcionarioData.endereco || '',
        numero: funcionarioData.numero || '',
        complemento: funcionarioData.complemento || '',
        bairro: funcionarioData.bairro || '',
        cep: funcionarioData.cep ? formatarCEP(funcionarioData.cep) : '',
        cidadeId: funcionarioData.cidadeId || '',
        observacoes: funcionarioData.observacoes || '',
        ativo: funcionarioData.ativo !== false,
        // Novos campos
        apelido: funcionarioData.apelido || '',
        cnh: funcionarioData.cnh || '',
        dataValidadeCNH: funcionarioData.dataValidadeCNH ? funcionarioData.dataValidadeCNH.substring(0, 10) : '',
        sexo: funcionarioData.sexo?.toString() || '',
        estadoCivil: funcionarioData.estadoCivil?.toString() || '',
        isBrasileiro: funcionarioData.isBrasileiro === false ? 0 : 1,
        nacionalidade: funcionarioData.nacionalidade || 1
      });
      
      // Carregar cidade se disponível
      if (funcionarioData.cidade) {
        setCidadeSelecionada(funcionarioData.cidade);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      setSubmitError('Erro ao carregar os dados do funcionário.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError, setFieldValue }) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      // Validações extras
      if (!values.nome || !values.nome.trim()) {
        setFieldError('nome', 'Nome é obrigatório');
        setSubmitting(false);
        return;
      }
      
      // Validar compatibilidade de CNH
      if (funcaoSelecionada?.requerCNH && funcaoSelecionada?.tipoCNHRequerido) {
        const cnhFuncionario = values.cnh;
        const cnhRequerida = funcaoSelecionada.tipoCNHRequerido;
        
        if (!cnhFuncionario) {
          setFieldError('cnh', `A função selecionada requer CNH categoria ${cnhRequerida}`);
          setCnhError(`A função requer CNH categoria ${cnhRequerida}. Por favor, informe a CNH do funcionário.`);
          setSubmitting(false);
          return;
        }
        
        if (!verificarCompatibilidadeCNH(cnhFuncionario, cnhRequerida)) {
          setFieldError('cnh', `A CNH categoria ${cnhFuncionario} não é compatível com a categoria ${cnhRequerida} exigida pela função`);
          setCnhError(`A função requer CNH categoria ${cnhRequerida}. A CNH categoria ${cnhFuncionario} não é compatível.`);
          setSubmitting(false);
          return;
        }
      }
      
      // Garantir que nacionalidade seja um número válido ou null
      if (values.nacionalidade && typeof values.nacionalidade === 'string') {
        if (isNaN(parseInt(values.nacionalidade))) {
          setFieldValue('nacionalidade', values.isBrasileiro ? 1 : null);
        } else {
          setFieldValue('nacionalidade', parseInt(values.nacionalidade));
        }
      }
      
      // Verificar nome antes de enviar (garantir que nunca seja vazio)
      if (!values.nome || values.nome.trim() === '') {
        setFieldError('nome', 'Nome é obrigatório');
        setSubmitting(false);
        return;
      }
      
      // Log de depuração dos valores antes da submissão
      console.log('Valores antes de formatar para envio:', {
        nome: values.nome,
        nacionalidade: values.nacionalidade,
        tipoNacionalidade: typeof values.nacionalidade,
        isBrasileiro: values.isBrasileiro,
        tipoIsBrasileiro: typeof values.isBrasileiro
      });
      
      // Converter campos formatados, tratando possíveis nulos e campos especiais
      // Importante: Campos com primeira letra maiúscula para corresponder ao esperado pelo backend
      const funcionarioDTOData = {
        Id: id ? parseInt(id) : undefined, 
        Nome: values.nome.trim(), // Garantir que o nome nunca seja vazio e esteja sempre trimado
        TipoPessoa: "F", // Sempre pessoa física
        CPF: values.cpf ? values.cpf.replace(/[^\d]/g, '') : null,
        RG: values.rg || null,
        DataNascimento: values.dataNascimento || null,
        Email: values.email,
        Telefone: values.telefone ? values.telefone.replace(/[^\d]/g, '') : null,
        Endereco: values.endereco,
        Numero: values.numero,
        Complemento: values.complemento || null,
        Bairro: values.bairro,
        CEP: values.cep ? values.cep.replace(/[^\d]/g, '') : null,
        CidadeId: values.cidadeId ? parseInt(values.cidadeId) : null,
        FuncaoFuncionarioId: values.funcaoFuncionarioId ? parseInt(values.funcaoFuncionarioId) : null,
        DataAdmissao: values.dataAdmissao || null,
        DataDemissao: values.dataDemissao || null,
        // Converter valor do salário para formato numérico (ex: 1234.56)
        Salario: values.salario 
          ? parseFloat(values.salario.replace(/\./g, '').replace(',', '.'))
          : 0,
        Observacoes: values.observacoes || null,
        Ativo: values.ativo === true,
        // Campos adicionais
        Apelido: values.apelido || null,
        CNH: values.cnh || null,
        DataValidadeCNH: values.dataValidadeCNH || null,
        Sexo: values.sexo ? parseInt(values.sexo) : null,
        EstadoCivil: values.estadoCivil ? parseInt(values.estadoCivil) : null,
        // Garantir que isBrasileiro seja sempre um inteiro (0 ou 1)
        IsBrasileiro: parseInt(values.isBrasileiro) === 1 || values.isBrasileiro === true || values.isBrasileiro === "1" ? 1 : 0,
        // SEMPRE converter Nacionalidade para número inteiro
        Nacionalidade: values.isBrasileiro === 1 || values.isBrasileiro === true || values.isBrasileiro === "1" 
          ? 1 // Brasileiros sempre têm nacionalidade 1
          : (values.nacionalidade ? parseInt(values.nacionalidade) : null)
      };

      // Garantir que os campos críticos estejam corretamente formatados
      if (typeof funcionarioDTOData.Nome !== 'string' || funcionarioDTOData.Nome.trim() === '') {
        console.error('Nome inválido:', funcionarioDTOData.Nome);
        setFieldError('nome', 'Nome é obrigatório');
        setSubmitting(false);
        return;
      }

      // Aplicar sanitização de dados para garantir tipos corretos
      const dadosSanitizados = sanitizarValoresFuncionario(funcionarioDTOData);
      
      console.log('ANTES DA SANITIZAÇÃO:', JSON.stringify(funcionarioDTOData, null, 2));
      console.log('DEPOIS DA SANITIZAÇÃO:', JSON.stringify(dadosSanitizados, null, 2));

      // O backend espera receber o objeto diretamente, sem wrapper
      const payload = dadosSanitizados;
      
      // Log detalhado do payload para depuração
      console.log('PAYLOAD FINAL:', JSON.stringify(payload, null, 2));
      
      // Log detalhado de TODOS os campos críticos
      console.log('DADOS CRÍTICOS:', {
        nome: {
          valor: payload.Nome,
          tipo: typeof payload.Nome,
          tamanho: payload.Nome ? payload.Nome.length : 0,
          temEspacos: payload.Nome ? payload.Nome.includes(' ') : false,
          trimado: payload.Nome ? payload.Nome.trim() === payload.Nome : false
        },
        tipoPessoa: {
          valor: payload.TipoPessoa,
          tipo: typeof payload.TipoPessoa
        },
        nacionalidade: {
          valor: payload.Nacionalidade,
          tipo: typeof payload.Nacionalidade,
          éNumero: !isNaN(payload.Nacionalidade)
        },
        isBrasileiro: {
          valor: payload.IsBrasileiro,
          tipo: typeof payload.IsBrasileiro
        }
      });
      
      let response;
      try {
        if (id) {
          response = await axios.put(`/api/Funcionario/${id}`, payload);
          console.log('Resposta da API (PUT):', response.data);
        } else {
          response = await axios.post('/api/Funcionario', payload);
          console.log('Resposta da API (POST):', response.data);
        }
        
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/funcionarios');
        }, 1500);
      } catch (error) {
        console.error('Erro detalhado da requisição:', error);
        
        let mensagemErro = "Erro ao salvar funcionário. Tente novamente.";
        
        if (error.response) {
          console.error('Status do erro:', error.response.status);
          console.error('Dados da resposta de erro:', error.response.data);
          
          // Verificar se há uma mensagem específica de erro vinda do backend
          if (error.response.data && error.response.data.mensagem) {
            mensagemErro = error.response.data.mensagem;
          } else if (error.response.data && typeof error.response.data === 'string') {
            mensagemErro = error.response.data;
          }
          
          // Verificar erros de validação específicos
          if (error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors;
            const errorMessages = [];
            
            console.log('ERROS DE VALIDAÇÃO:', JSON.stringify(errors, null, 2));
            console.log('RESPOSTA COMPLETA:', error.response.data);
            
            // Mapear erros para mensagens amigáveis
            Object.keys(errors).forEach(key => {
              console.log(`Erro no campo '${key}':`, errors[key]);
              const errorText = Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key];
              errorMessages.push(`${key}: ${errorText}`);
              
              // Verificar o formato específico do erro
              const keyLower = key.toLowerCase();
              
              // Tratamento especial para erro "O nome do funcionário é obrigatório"
              if (errorText.includes("nome") && errorText.includes("obrigatório")) {
                console.warn("ERRO DE NOME DETECTADO:", errorText);
                setFieldError('nome', 'Nome é obrigatório');
                const elementoNome = document.getElementById('nome');
                if (elementoNome) {
                  elementoNome.focus();
                  elementoNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
              
              // Verificar diferentes formas que o backend pode reportar erros para o campo nome
              if (keyLower === 'nome' || keyLower.includes('nome')) {
                const msgErro = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                console.warn("ERRO ESPECÍFICO DO CAMPO NOME:", msgErro);
                setFieldError('nome', msgErro);
                
                // Destacar o campo com o erro
                const elementoNome = document.getElementById('nome');
                if (elementoNome) {
                  elementoNome.focus();
                  elementoNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
              
              // Verificar erros de nacionalidade
              if (keyLower === '$.nacionalidade' || keyLower.includes('nacionalidade')) {
                console.warn("ERRO DE NACIONALIDADE:", errorText);
                setFieldError('nacionalidade', 'A nacionalidade deve ser um número inteiro');
                
                // Ajuste automático para nacionalidade - se brasileiro, define como 1
                if (values.isBrasileiro === 1 || values.isBrasileiro === true || values.isBrasileiro === "1") {
                  setFieldValue('nacionalidade', 1);
                } else {
                  // Se não for brasileiro, define para primeiro valor não-brasileiro
                  setFieldValue('nacionalidade', 2);  
                }
              }
              
              // Erro genérico no objeto
              if (keyLower === 'error' || keyLower === '$') {
                const msgErro = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                console.warn("ERRO GENÉRICO:", msgErro);
                mensagemErro = msgErro;
                
                // Se for erro de nome, destaca o campo nome
                if (msgErro.toLowerCase().includes('nome')) {
                  setFieldError('nome', msgErro);
                  const elementoNome = document.getElementById('nome');
                  if (elementoNome) {
                    elementoNome.focus();
                    elementoNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
            });
            
            if (errorMessages.length > 0) {
              mensagemErro = errorMessages.join('; ');
            }
          }
        }
        
        setSubmitError(mensagemErro);
        setSubmitting(false);
        throw error;
      }
      
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      
      // Analisar detalhes completos do erro
      let mensagemErro = 'Erro ao salvar funcionário.';
      
      if (error.response) {
        console.error('DETALHES COMPLETOS DO ERRO:', error.response.data);
        console.error('STATUS HTTP:', error.response.status);
        
        // Tentar extrair mensagens de erro mais detalhadas
        const responseData = error.response.data;
        
        if (responseData.title) {
          mensagemErro = responseData.title;
        }
        
        // Erro específico do nome do funcionário (tratamento especial)
        if (responseData.erro && responseData.erro.includes("nome do funcionário é obrigatório")) {
          console.warn("ERRO DE NOME OBRIGATÓRIO DETECTADO:", responseData.erro);
          setFieldError('nome', responseData.erro);
          const elementoNome = document.getElementById('nome');
          if (elementoNome) {
            elementoNome.focus();
            elementoNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        if (responseData.errors) {
          // Exibir os erros específicos para campos
          const erros = [];
          for (const key in responseData.errors) {
            if (Array.isArray(responseData.errors[key])) {
              const errorMsg = `${key}: ${responseData.errors[key].join(', ')}`;
              erros.push(errorMsg);
              
              // Destacar campos com erros específicos
              if (key.toLowerCase().includes('nome') || responseData.errors[key].join(' ').toLowerCase().includes('nome')) {
                setFieldError('nome', responseData.errors[key][0]);
              }
              if (key.toLowerCase().includes('nacionalidade')) {
                setFieldError('nacionalidade', responseData.errors[key][0]);
              }
            }
          }
          
          if (erros.length > 0) {
            mensagemErro += '\n' + erros.join('\n');
          }
        }
        
        if (responseData.mensagem) {
          mensagemErro = responseData.mensagem;
        }
        
        if (responseData.message) {
          mensagemErro = responseData.message;
        }
        
        if (responseData.erro) {
          mensagemErro = responseData.erro;
        }
      }
      
      setSubmitError(mensagemErro);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSalarioChange = (e, setFieldValue) => {
    // Remove todos os caracteres que não são dígitos
    let valor = e.target.value.replace(/\D/g, '');
    
    // Se estiver vazio, define como zero
    if (valor === '' || valor === '0') {
      setFieldValue('salario', '0,00');
      return;
    }
    
    // Converte para um número com 2 casas decimais (centavos)
    // Divide por 100 para tratar os últimos 2 dígitos como centavos
    const valorNumerico = parseFloat(valor) / 100;
    
    // Formata o valor usando padrão brasileiro, sem o prefixo "R$ "
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Atualiza o campo
    setFieldValue('salario', valorFormatado);
  };

  // Função para sanitizar valores e garantir tipos corretos para o backend
  const sanitizarValoresFuncionario = (dados) => {
    return {
      ...dados,
      // Garantir que o nome nunca seja vazio ou apenas espaços
      Nome: dados.Nome ? dados.Nome.trim() : '',
      
      // Converter campos que devem ser números para números
      Nacionalidade: typeof dados.Nacionalidade === 'string' 
        ? parseInt(dados.Nacionalidade) 
        : (typeof dados.Nacionalidade === 'number' ? dados.Nacionalidade : null),
      
      // Garantir que isBrasileiro seja sempre inteiro
      IsBrasileiro: dados.IsBrasileiro === true || dados.IsBrasileiro === 1 || dados.IsBrasileiro === '1' ? 1 : 0,
      
      // Se for brasileiro, garantir que nacionalidade seja 1
      ...(dados.IsBrasileiro === true || dados.IsBrasileiro === 1 || dados.IsBrasileiro === '1' 
          ? { Nacionalidade: 1 } 
          : {}
      )
    };
  };

  // Função para validar se a categoria de CNH do funcionário é compatível com a exigida pela função
  const verificarCompatibilidadeCNH = (cnhFuncionario, cnhRequerida) => {
    if (!cnhRequerida) return true; // Se a função não exige CNH, qualquer CNH é válida
    if (!cnhFuncionario) return false; // Se a função exige CNH mas o funcionário não tem, é inválido
    
    // Mapeamento de hierarquia de CNH
    const hierarquiaCNH = {
      'A': ['A', 'AB', 'AC', 'AD', 'AE'],
      'B': ['B', 'AB', 'E'],
      'AB': ['AB', 'AE'],
      'C': ['C', 'AC', 'E'],
      'D': ['D', 'AD', 'E'],
      'E': ['E', 'AE'],
      'AC': ['AC', 'AE'],
      'AD': ['AD', 'AE'],
      'AE': ['AE']
    };
    
    // Verificar se a CNH do funcionário está na lista de CNHs que cobrem a exigência
    if (cnhRequerida === cnhFuncionario) return true; // CNH exata
    
    // Para CNH composta (E, AE, etc), verificar regras específicas
    if (cnhRequerida === 'E') {
      // Para ter E, precisa ter C ou D
      return ['C', 'D', 'E', 'AC', 'AD', 'AE'].includes(cnhFuncionario);
    }
    
    if (cnhRequerida === 'AE') {
      // Para ter AE, precisa ter AC ou AD
      return ['AC', 'AD', 'AE'].includes(cnhFuncionario);
    }
    
    // Verificar no mapeamento de hierarquia
    return hierarquiaCNH[cnhFuncionario]?.includes(cnhRequerida) || false;
  };

  // Efeito para atualizar o cidadeId quando cidadeSelecionada mudar
  useEffect(() => {
    if (cidadeSelecionada && formikRef.current) {
      formikRef.current.setFieldValue('cidadeId', cidadeSelecionada.id);
    }
  }, [cidadeSelecionada]);

  if (initialLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 fw-bold">
              {id ? 'Editar funcionário' : 'Novo funcionário'}
            </h3>
          </div>

          {submitError && (
            <Alert color="danger" fade={false} timeout={0}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{submitError}</pre>
            </Alert>
          )}

          {submitSuccess && (
            <Alert color="success" fade={false} timeout={0}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Funcionário salvo com sucesso!
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={createValidationSchema()}
            onSubmit={handleSubmit}
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
            innerRef={formikRef}
          >
            {({ values, errors, touched, setFieldValue, setFieldError, setFieldTouched, isSubmitting }) => (
              <Form data-formik-form="true" ref={formRef}>
                {/* Dados Pessoais */}
                <h4 className="text-primary mb-4" style={sectionHeaderStyle}>Dados pessoais</h4>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="nome">Funcionário <span className="text-danger">*</span></Label>
                      <Input
                        type="text"
                        id="nome"
                        name="nome"
                        data-formik-input="true"
                        value={values.nome || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          console.log('Campo nome alterado para:', valor);
                          setFieldValue('nome', valor);
                          
                          // Removendo campo funcionario que pode estar causando conflitos
                          if ('funcionario' in values) {
                            setFieldValue('funcionario', undefined);
                            console.log('Campo funcionario removido para evitar conflitos');
                          }
                        }}
                        onBlur={(e) => {
                          const valorAtual = e.target.value;
                          console.log('Valor do campo nome no blur:', valorAtual);
                          
                          // Validação extra para o nome
                          if (!valorAtual || !valorAtual.trim()) {
                            setFieldError('nome', 'Nome é obrigatório');
                          } else if (valorAtual.trim().length < 3) {
                            setFieldError('nome', 'Nome deve ter pelo menos 3 caracteres');
                          } else {
                            // Garantir que o valor esteja corretamente definido
                            setFieldValue('nome', valorAtual.trim());
                          }
                          setFieldTouched('nome', true);
                        }}
                        invalid={errors.nome && touched.nome}
                        placeholder="Nome completo"
                      />
                      {errors.nome && touched.nome && (
                        <FormFeedback>{errors.nome}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="apelido">Apelido</Label>
                      <Field name="apelido">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="apelido"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.apelido && touched.apelido && (
                        <FormFeedback>{errors.apelido}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="cpf">CPF <span className="text-danger">*</span></Label>
                      <Input
                        type="text"
                        id="cpf"
                        name="cpf"
                        data-formik-input="true"
                        value={values.cpf || ''}
                        invalid={errors.cpf && touched.cpf}
                        onChange={(e) => {
                          const formatted = formatarCPF(e.target.value);
                          setFieldValue('cpf', formatted);
                        }}
                        onBlur={() => setFieldTouched('cpf', true)}
                      />
                      {errors.cpf && touched.cpf && (
                        <FormFeedback>{errors.cpf}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="rg">RG</Label>
                      <Field name="rg">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="rg"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="dataNascimento">Data de nascimento</Label>
                      <Field name="dataNascimento">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="date"
                            id="dataNascimento"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="email">Email <span className="text-danger">*</span></Label>
                      <Field name="email">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="email"
                            id="email"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.email && touched.email && (
                        <FormFeedback>{errors.email}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="telefone">Telefone</Label>
                      <Field name="telefone">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="telefone"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                            onChange={(e) => {
                              const formatted = formatarTelefone(e.target.value);
                              setFieldValue('telefone', formatted);
                            }}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="sexo">Sexo</Label>
                      <Field name="sexo">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="select"
                            id="sexo"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          >
                            <option value="">Selecione...</option>
                            <option value="1">Masculino</option>
                            <option value="2">Feminino</option>
                            <option value="3">Outro</option>
                          </Input>
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="estadoCivil">Estado civil</Label>
                      <Field name="estadoCivil">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="select"
                            id="estadoCivil"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          >
                            <option value="">Selecione...</option>
                            <option value="1">Solteiro(a)</option>
                            <option value="2">Casado(a)</option>
                            <option value="3">Divorciado(a)</option>
                            <option value="4">Viúvo(a)</option>
                            <option value="5">União Estável</option>
                          </Input>
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={8}>
                    <FormGroup>
                      <Label for="nacionalidade">Nacionalidade</Label>
                      <div className="d-flex align-items-center mb-2">
                        <div className="form-check form-switch me-3">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            id="isBrasileiro"
                            role="switch"
                            data-formik-input="true"
                            checked={values.isBrasileiro === 1 || values.isBrasileiro === true || values.isBrasileiro === "1"}
                            onChange={(e) => {
                              setFieldValue('isBrasileiro', e.target.checked ? 1 : 0);
                              if (e.target.checked) {
                                setFieldValue('nacionalidade', 1); // Valor numérico para brasileiro
                              } else {
                                setFieldValue('nacionalidade', null); // Limpar quando não for brasileiro
                              }
                            }}
                          />
                          <Label className="form-check-label" for="isBrasileiro">
                            Brasileiro
                          </Label>
                        </div>
                        <Input
                          type="select"
                          id="nacionalidade"
                          name="nacionalidade"
                          data-formik-input="true"
                          className="flex-grow-1"
                          value={values.nacionalidade || ''}
                          onChange={(e) => {
                            const valor = e.target.value ? parseInt(e.target.value) : null;
                            console.log('Alterando nacionalidade para:', valor, 'tipo:', typeof valor);
                            setFieldValue('nacionalidade', valor);
                          }}
                          disabled={values.isBrasileiro === 1 || values.isBrasileiro === true || values.isBrasileiro === "1"}
                        >
                          <option value="">Selecione a nacionalidade</option>
                          <option value="1">Brasileiro(a)</option>
                          <option value="2">Americano(a)</option>
                          <option value="3">Argentino(a)</option>
                          <option value="4">Uruguaio(a)</option>
                          <option value="5">Paraguaio(a)</option>
                          <option value="6">Chileno(a)</option>
                          <option value="7">Peruano(a)</option>
                          <option value="8">Colombiano(a)</option>
                          <option value="9">Venezuelano(a)</option>
                          <option value="10">Outro</option>
                        </Input>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Informações adicionais */}
                <h4 className="text-primary mt-5 mb-4" style={sectionHeaderStyle}>Informações complementares</h4>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="cnh">Categoria da CNH</Label>
                      <Field name="cnh">
                        {({ field, meta }) => (
                          <>
                            <Input
                              {...field}
                              type="select"
                              id="cnh"
                              data-formik-input="true"
                              invalid={meta.error && meta.touched || cnhError}
                              onChange={(e) => {
                                setFieldValue('cnh', e.target.value.toUpperCase());
                                
                                // Verificar compatibilidade com a função selecionada
                                if (funcaoSelecionada?.requerCNH && funcaoSelecionada?.tipoCNHRequerido) {
                                  const cnhFuncionario = e.target.value.toUpperCase();
                                  const cnhRequerida = funcaoSelecionada.tipoCNHRequerido.toUpperCase();
                                  
                                  if (cnhFuncionario && !verificarCompatibilidadeCNH(cnhFuncionario, cnhRequerida)) {
                                    setCnhError(`A função requer CNH categoria ${cnhRequerida}. A CNH categoria ${cnhFuncionario} não é compatível.`);
                                  } else if (!cnhFuncionario) {
                                    setCnhError(`A função requer CNH categoria ${cnhRequerida}. Por favor, informe a CNH do funcionário.`);
                                  } else {
                                    setCnhError(null);
                                  }
                                }
                              }}
                            >
                              <option value="">Selecione uma categoria...</option>
                              <option value="A">A - Motocicletas</option>
                              <option value="B">B - Carros de passeio</option>
                              <option value="AB">AB - Motos e carros</option>
                              <option value="C">C - Veículos de carga acima de 3,5 ton</option>
                              <option value="D">D - Veículos com mais de 8 passageiros</option>
                              <option value="E">E - Veículos com unidade acoplada</option>
                              <option value="AC">AC - Motos e veículos de carga</option>
                              <option value="AD">AD - Motos e veículos de passageiros</option>
                              <option value="AE">AE - Motos e veículos com unidade acoplada</option>
                            </Input>
                            {cnhError && (
                              <div className="invalid-feedback d-block">{cnhError}</div>
                            )}
                            {meta.error && meta.touched && !cnhError && (
                              <FormFeedback>{meta.error}</FormFeedback>
                            )}
                            {funcaoSelecionada?.requerCNH && funcaoSelecionada?.tipoCNHRequerido && (
                              <small className="text-info mt-1 d-block">
                                A função selecionada requer CNH categoria {funcaoSelecionada.tipoCNHRequerido}
                              </small>
                            )}
                          </>
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="dataValidadeCNH">Validade da CNH</Label>
                      <Field name="dataValidadeCNH">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="date"
                            id="dataValidadeCNH"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Dados profissionais */}
                <h4 className="text-primary mt-5 mb-4" style={sectionHeaderStyle}>Dados profissionais</h4>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="funcaoFuncionarioId">Função de funcionário <span className="text-danger">*</span></Label>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <Input
                            type="text"
                            name="funcaoFuncionarioNome"
                            id="funcaoFuncionarioNome"
                            data-formik-input="true"
                            value={values.funcaoFuncionarioNome || ''}
                            readOnly
                            invalid={touched.funcaoFuncionarioId && !!errors.funcaoFuncionarioId}
                          />
                          <Input
                            type="hidden"
                            name="funcaoFuncionarioId"
                            id="funcaoFuncionarioId"
                            data-formik-input="true"
                            value={values.funcaoFuncionarioId || ''}
                          />
                        </div>
                        <SearchButton
                          onClick={() => setFuncaoModalOpen(true)}
                          title="Buscar função de funcionário"
                        />
                      </div>
                      {touched.funcaoFuncionarioId && errors.funcaoFuncionarioId && (
                        <FormFeedback style={{ display: 'block' }}>{errors.funcaoFuncionarioId}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="dataAdmissao">Data de admissão</Label>
                      <Field name="dataAdmissao">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="date"
                            id="dataAdmissao"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="dataDemissao">Data de demissão</Label>
                      <Field name="dataDemissao">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="date"
                            id="dataDemissao"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="salario">Salário</Label>
                      <Field name="salario">
                        {({ field, meta }) => (
                          <InputGroup>
                            <InputGroupText>R$</InputGroupText>
                            <Input
                              {...field}
                              type="text"
                              id="salario"
                              data-formik-input="true"
                              invalid={meta.error && meta.touched}
                              onChange={(e) => handleSalarioChange(e, setFieldValue)}
                              onBlur={(e) => {
                                // Se o valor estiver vazio, coloca 0,00
                                if (!field.value || field.value.trim() === '') {
                                  setFieldValue('salario', '0,00');
                                  return;
                                }
                                
                                try {
                                  // Normaliza o valor
                                  const valorTexto = field.value.replace(/\./g, '').replace(',', '.');
                                  const valorNumerico = parseFloat(valorTexto);
                                  
                                  if (isNaN(valorNumerico)) {
                                    setFieldValue('salario', '0,00');
                                    return;
                                  }
                                  
                                  // Formata com padrão brasileiro
                                  const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  });
                                  setFieldValue('salario', valorFormatado);
                                } catch (e) {
                                  // Em caso de erro, define como 0,00
                                  setFieldValue('salario', '0,00');
                                }
                              }}
                            />
                          </InputGroup>
                        )}
                      </Field>
                      {errors.salario && touched.salario && (
                        <FormFeedback style={{ display: 'block' }}>{errors.salario}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                {/* Endereço */}
                <h4 className="text-primary mt-5 mb-4" style={sectionHeaderStyle}>Endereço</h4>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="endereco">Endereço <span className="text-danger">*</span></Label>
                      <Field name="endereco">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="endereco"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.endereco && touched.endereco && (
                        <FormFeedback>{errors.endereco}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label for="numero">Número <span className="text-danger">*</span></Label>
                      <Field name="numero">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="numero"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.numero && touched.numero && (
                        <FormFeedback>{errors.numero}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="complemento">Complemento</Label>
                      <Field name="complemento">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="complemento"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="bairro">Bairro <span className="text-danger">*</span></Label>
                      <Field name="bairro">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="bairro"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.bairro && touched.bairro && (
                        <FormFeedback>{errors.bairro}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="cep">CEP</Label>
                      <Field name="cep">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="text"
                            id="cep"
                            data-formik-input="true"
                            invalid={meta.error && meta.touched}
                            onChange={(e) => {
                              const formatted = formatarCEP(e.target.value);
                              setFieldValue('cep', formatted);
                            }}
                          />
                        )}
                      </Field>
                      {errors.cep && touched.cep && (
                        <FormFeedback>{errors.cep}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={5}>
                    <FormGroup>
                      <Label for="cidadeId">Cidade <span className="text-danger">*</span></Label>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <Input
                            type="text"
                            name="cidadeNome"
                            id="cidadeNome"
                            data-formik-input="true"
                            value={cidadeSelecionada ? `${cidadeSelecionada.nome} - ${cidadeSelecionada.estado?.uf || ''}` : ''}
                            readOnly
                            placeholder="Selecione uma cidade..."
                            invalid={touched.cidadeId && !!errors.cidadeId}
                          />
                        </div>
                        <SearchButton
                          onClick={() => setCidadeModalOpen(true)}
                          title="Buscar cidade"
                        />
                      </div>
                      {touched.cidadeId && errors.cidadeId && (
                        <FormFeedback style={{ display: 'block' }}>{errors.cidadeId}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <h4 className="text-primary mt-5 mb-4" style={sectionHeaderStyle}>Observações</h4>
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Field name="observacoes">
                        {({ field, meta }) => (
                          <Input
                            {...field}
                            type="textarea"
                            id="observacoes"
                            placeholder="Adicione observações sobre o funcionário"
                            data-formik-input="true"
                            rows={3}
                            invalid={meta.error && meta.touched}
                          />
                        )}
                      </Field>
                      {errors.observacoes && touched.observacoes && (
                        <FormFeedback>{errors.observacoes}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                {/* Status */}
                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup check className="mb-4 mt-2">
                      <div className="form-check form-switch">
                        <Field name="ativo">
                          {({ field }) => (
                            <Input
                              {...field}
                              type="checkbox"
                              className="form-check-input"
                              id="ativo"
                              role="switch"
                              data-formik-input="true"
                              checked={values.ativo}
                            />
                          )}
                        </Field>
                        <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                          Ativo <span style={{ fontWeight: 400 }}>
                            {values.ativo ? 
                              <span className="text-success">(Registro Ativo)</span> : 
                              <span className="text-danger">(Registro Inativo)</span>}
                          </span>
                        </Label>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                  <Button 
                    type="submit" 
                    color="primary"
                    className="me-2 px-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    color="secondary" 
                    className="px-4"
                    onClick={() => navigate('/funcionarios')}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Container>
  );
};

export default FuncionarioForm;
