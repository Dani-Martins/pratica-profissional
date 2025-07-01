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
import SearchButton from '../../components/buttons/SearchButton';
import CidadeSearchModal from '../Localizacao/Cidade/CidadeSearchModal';
import CondicaoPagamentoSearchModal from '../Financeiro/CondicaoPagamento/CondicaoPagamentoSearchModal';

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
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatarCEP = (cep) => {
  cep = cep.replace(/[^\d]/g, '');
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const formatarTelefone = (telefone) => {
  telefone = telefone.replace(/[^\d]/g, '');
  if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

// Função para formatar valor monetário no padrão brasileiro (R$)
const formatarMoeda = (valor) => {
  // Garante que o valor é um número
  let numero = parseFloat(valor);
  if (isNaN(numero)) numero = 0;
  
  // Formata para o padrão brasileiro
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para converter valor formatado em float
const parseMoeda = (valor) => {
  if (!valor) return 0;
  
  // Remove o símbolo da moeda e converte vírgula para ponto
  const valorNumerico = valor.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(valorNumerico) || 0;
};// Schema de validação dinâmico
const createValidationSchema = (tipoPessoa) => {
  const baseSchema = {
    tipoPessoa: Yup.string().required('Tipo de pessoa é obrigatório'),
    email: Yup.string().email('Email inválido'),
    telefone: Yup.string(),
    endereco: Yup.string(),
    numero: Yup.string(),
    complemento: Yup.string(),
    bairro: Yup.string(),
    cep: Yup.string().matches(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    cidadeId: Yup.number().positive('Selecione uma cidade'),
    ativo: Yup.boolean(),
    // Campos comuns
    apelido: Yup.string().max(60, 'Apelido deve ter no máximo 60 caracteres'),
    limiteCredito: Yup.string().nullable(),
    limiteCredito2: Yup.string().nullable(),
    observacao: Yup.string().max(255, 'Observação deve ter no máximo 255 caracteres'),
    condicaoPagamentoId: Yup.number().nullable()
  };
  
  if (tipoPessoa === 'F') {
    // Pessoa Física - incluir campos específicos
    return Yup.object().shape({
      ...baseSchema,
      nome: Yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
      nacionalidade: Yup.string().max(255, 'Nacionalidade deve ter no máximo 255 caracteres'),
      isBrasileiro: Yup.boolean(),
      rg: Yup.string().max(14, 'RG deve ter no máximo 14 caracteres'),
      dataNascimento: Yup.date().nullable().typeError('Data de nascimento inválida'),
      estadoCivil: Yup.string().max(255, 'Estado civil deve ter no máximo 255 caracteres'),
      sexo: Yup.string().max(1, 'Sexo deve ter no máximo 1 caractere'),
      cpf: Yup.string().when(['isBrasileiro'], {
        is: (isBrasileiro) => isBrasileiro === true,
        then: () => Yup.string().required('CPF é obrigatório').test('cpf-valido', 'CPF inválido', validarCPF),
        otherwise: () => Yup.string().required('Passaporte/ID Estrangeiro é obrigatório')
      })
    });
  } else {
    // Pessoa Jurídica
    return Yup.object().shape({
      ...baseSchema,
      razaoSocial: Yup.string().required('Razão Social é obrigatória').min(2, 'Razão Social deve ter pelo menos 2 caracteres'),
      cnpj: Yup.string().required('CNPJ é obrigatório').test('cnpj-valido', 'CNPJ inválido', validarCNPJ)
    });
  }
};

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [tipoPessoaValue, setTipoPessoaValue] = useState('F');
  // Adicionar estado para condições de pagamento
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState(null);
  const [condicaoPagamentoModalOpen, setCondicaoPagamentoModalOpen] = useState(false);
  // Usar React.useRef em vez de estado para armazenar referência ao Formik
  const formikRef = React.useRef(null);  const [initialValues, setInitialValues] = useState({
    tipoPessoa: 'F',
    nome: '',
    cpf: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',    
    ativo: true,
    // Novos campos
    apelido: '',
    isBrasileiro: true,
    nacionalidade: 'Brasileiro(a)',
    limiteCredito: 'R$ 0,00',
    limiteCredito2: 'R$ 0,00',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    sexo: '',
    observacao: '',
    condicaoPagamentoId: null
  });  
  useEffect(() => {
    if (id) {
      carregarCliente();
    }
    
    // Carregar condições de pagamento
    carregarCondicoesPagamento();
  }, [id]);
  
  // Esse efeito garante que, quando cidadeSelecionada mudar, 
  // atualizamos o campo cidadeId se tivermos acesso ao formik
  useEffect(() => {
    if (cidadeSelecionada) {
      console.log("Cidade selecionada:", JSON.stringify(cidadeSelecionada, null, 2));
      if (formikRef.current && formikRef.current.setFieldValue) {
        formikRef.current.setFieldValue('cidadeId', cidadeSelecionada.id);
      }
    }
  }, [cidadeSelecionada]);
  
  // Efeito similar para condição de pagamento
  useEffect(() => {
    if (condicaoPagamentoSelecionada) {
      console.log("Condição de pagamento selecionada:", JSON.stringify(condicaoPagamentoSelecionada, null, 2));
      if (formikRef.current && formikRef.current.setFieldValue) {
        formikRef.current.setFieldValue('condicaoPagamentoId', condicaoPagamentoSelecionada.id);
      }
    }
  }, [condicaoPagamentoSelecionada]);
  
  const carregarCondicoesPagamento = async () => {
    try {
      const response = await axios.get('/api/CondicaoPagamento');
      setCondicoesPagamento(response.data);
      console.log("Condições de pagamento carregadas:", response.data);
    } catch (error) {
      console.error("Erro ao carregar condições de pagamento:", error);
    }
  };
  const carregarCliente = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get(`/api/Cliente/${id}`);
      const cliente = response.data;
      
      console.log('Dados do cliente carregados:', cliente);
        setInitialValues({
        tipoPessoa: cliente.tipoPessoa || 'F',
        nome: cliente.nome || '',
        cpf: cliente.cpf || '',
        razaoSocial: cliente.razaoSocial || '',
        nomeFantasia: cliente.nomeFantasia || '',
        cnpj: cliente.cnpj || '',
        inscricaoEstadual: cliente.inscricaoEstadual || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro || '',
        cep: cliente.cep || '',
        cidadeId: cliente.cidadeId || '',
        ativo: cliente.ativo !== false,        // Novos campos
        apelido: cliente.apelido || '',
        isBrasileiro: cliente.isBrasileiro !== false,
        limiteCredito: cliente.limiteCredito ? formatarMoeda(cliente.limiteCredito) : 'R$ 0,00',
        nacionalidade: cliente.nacionalidade || '',
        rg: cliente.rg || '',
        dataNascimento: cliente.dataNascimento ? new Date(cliente.dataNascimento) : null,
        estadoCivil: cliente.estadoCivil || '',
        sexo: cliente.sexo || '',
        condicaoPagamentoId: cliente.condicaoPagamentoId || '',
        limiteCredito2: cliente.limiteCredito2 ? formatarMoeda(cliente.limiteCredito2) : 'R$ 0,00',
        observacao: cliente.observacao || ''
      });
        setTipoPessoaValue(cliente.tipoPessoa || 'F');
      
      if (cliente.cidade) {
        setCidadeSelecionada(cliente.cidade);
      }
      
      // Processar condição de pagamento
      if (cliente.condicaoPagamento) {
        setCondicaoPagamentoSelecionada(cliente.condicaoPagamento);
      } else if (cliente.condicaoPagamentoId) {
        // Buscar a condição de pagamento pelo ID se não vier nos dados do cliente
        try {
          const condPagResponse = await axios.get(`/api/CondicaoPagamento/${cliente.condicaoPagamentoId}`);
          setCondicaoPagamentoSelecionada(condPagResponse.data);
        } catch (error) {
          console.error("Erro ao buscar condição de pagamento:", error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      setSubmitError('Erro ao carregar os dados do cliente.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
        const dadosParaEnvio = {
        ...values,
        cpf: values.cpf?.replace(/[^\d]/g, '') || null,
        cnpj: values.cnpj?.replace(/[^\d]/g, '') || null,
        cep: values.cep?.replace(/[^\d]/g, '') || null,
        telefone: values.telefone?.replace(/[^\d]/g, '') || null,
        // Converter os valores formatados de moeda para números
        limiteCredito: parseMoeda(values.limiteCredito),
        limiteCredito2: parseMoeda(values.limiteCredito2)
      };

      if (id) {
        await axios.put(`/api/Cliente/${id}`, dadosParaEnvio);
      } else {
        await axios.post('/api/Cliente', dadosParaEnvio);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setSubmitError(error.response?.data?.mensagem || 'Erro ao salvar cliente.');
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
  }  return (
    <Container fluid className="p-0">
      <Card className="border-0">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
              {id ? 'Editar Cliente' : 'Novo Cliente'}
            </h4>
            {/* Botão Voltar removido */}
          </div>

              {submitError && (
                <Alert color="danger">
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  {submitError}
                </Alert>
              )}

              {submitSuccess && (
                <Alert color="success">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Cliente salvo com sucesso!
                </Alert>
              )}              <Formik
                initialValues={initialValues}
                validationSchema={createValidationSchema(tipoPessoaValue)}
                enableReinitialize={true}
                onSubmit={handleSubmit}
                innerRef={formikRef}
              >
                {(formikProps) => {
                  // Armazena as props do formik para uso posterior
                  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
                  
                  // NUNCA atualizar estados durante a renderização
                  // Removido: setFormikInstance(formikProps);
                  
                  // Usamos useEffect no nível do componente principal
                  
                  return (
                    <Form>
                    {/* Tipo de Pessoa */}
                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Label for="tipoPessoa">Tipo de Pessoa <span className="text-danger">*</span></Label>
                          <div>
                            <FormGroup check inline>
                              <Input
                                type="radio"
                                name="tipoPessoa"
                                id="tipoPessoaF"
                                value="F"
                                checked={values.tipoPessoa === 'F'}                                onChange={(e) => {
                                  setFieldValue('tipoPessoa', e.target.value);
                                  setTipoPessoaValue(e.target.value);
                                  
                                  // Se mudar para pessoa física, limpar campos de pessoa jurídica
                                  if (e.target.value === 'F') {
                                    setFieldValue('razaoSocial', '');
                                    setFieldValue('nomeFantasia', '');
                                    setFieldValue('cnpj', '');
                                    setFieldValue('inscricaoEstadual', '');
                                  }
                                }}
                              />
                              <Label check for="tipoPessoaF">Pessoa Física</Label>
                            </FormGroup>
                            <FormGroup check inline>
                              <Input
                                type="radio"
                                name="tipoPessoa"
                                id="tipoPessoaJ"
                                value="J"
                                checked={values.tipoPessoa === 'J'}
                                onChange={(e) => {
                                  setFieldValue('tipoPessoa', e.target.value);
                                  setTipoPessoaValue(e.target.value);
                                  
                                  // Se mudar para pessoa jurídica, limpar campos de pessoa física
                                  if (e.target.value === 'J') {
                                    setFieldValue('nome', '');
                                    setFieldValue('cpf', '');
                                    setFieldValue('nacionalidade', '');
                                    setFieldValue('isBrasileiro', true);
                                    setFieldValue('rg', '');
                                    setFieldValue('dataNascimento', null);
                                    setFieldValue('estadoCivil', '');
                                    setFieldValue('sexo', '');
                                  }
                                }}
                              />
                              <Label check for="tipoPessoaJ">Pessoa Jurídica</Label>
                            </FormGroup>
                          </div>
                          {errors.tipoPessoa && touched.tipoPessoa && (
                            <FormFeedback style={{ display: 'block' }}>
                              {errors.tipoPessoa}
                            </FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>                    {/* Campos específicos por tipo de pessoa */}
                    {values.tipoPessoa === 'F' ? (
                      // Pessoa Física
                      <>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="nome">Cliente <span className="text-danger">*</span></Label>
                            <Field name="nome">
                              {({ field, meta }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  id="nome"
                                  invalid={meta.error && meta.touched}
                                  placeholder="Nome completo"
                                />
                              )}
                            </Field>
                            {errors.nome && touched.nome && (
                              <FormFeedback>{errors.nome}</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="nacionalidade">Nacionalidade</Label>
                            <Input
                              type="text"
                              id="nacionalidade"
                              name="nacionalidade"
                              value={values.nacionalidade}
                              onChange={(e) => setFieldValue('nacionalidade', e.target.value)}
                              invalid={errors.nacionalidade && touched.nacionalidade}
                              placeholder="Nacionalidade"
                            />
                            {errors.nacionalidade && touched.nacionalidade && (
                              <FormFeedback>{errors.nacionalidade}</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <FormGroup check className="mb-3">
                            <Input
                              type="checkbox"
                              name="isBrasileiro"
                              id="isBrasileiro"
                              checked={values.isBrasileiro}                              onChange={(e) => {
                                setFieldValue('isBrasileiro', e.target.checked);
                                // Se mudar para não brasileiro, limpa o CPF e a nacionalidade
                                if (!e.target.checked) {
                                  if (values.cpf) {
                                    setFieldValue('cpf', '');
                                  }
                                  // Limpa a nacionalidade quando desmarcar "É Brasileiro?"
                                  setFieldValue('nacionalidade', '');
                                } else {
                                  // Restaura o valor padrão de nacionalidade quando marcar "É Brasileiro?"
                                  setFieldValue('nacionalidade', 'Brasileiro(a)');
                                }
                              }}
                            />
                            <Label for="isBrasileiro" check>
                              É Brasileiro?
                            </Label>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="cpf">
                              {values.isBrasileiro ? 'CPF' : 'Passaporte/ID Estrangeiro'}
                              <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="cpf"
                              value={values.cpf}
                              onChange={(e) => {
                                if (values.isBrasileiro) {
                                  // Se for brasileiro, formata como CPF
                                  const formatted = formatarCPF(e.target.value);
                                  if (formatted.replace(/[^\d]/g, '').length <= 11) {
                                    setFieldValue('cpf', formatted);
                                  }
                                } else {
                                  // Se for estrangeiro, não formata
                                  setFieldValue('cpf', e.target.value);
                                }
                              }}
                              invalid={errors.cpf && touched.cpf}
                              placeholder={values.isBrasileiro ? "000.000.000-00" : "Número do Documento"}
                              maxLength={values.isBrasileiro ? 14 : 30}
                            />
                            {errors.cpf && touched.cpf && (
                              <FormFeedback>{errors.cpf}</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>                      </Row>
                      </>
                    ) : (
                      // Pessoa Jurídica
                      <>
                        <Row>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="razaoSocial">Cliente <span className="text-danger">*</span></Label>
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
                              </Field>
                              {errors.razaoSocial && touched.razaoSocial && (
                                <FormFeedback>{errors.razaoSocial}</FormFeedback>
                              )}
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
                        </Row>
                        <Row>
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
                                }}
                                invalid={errors.cnpj && touched.cnpj}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                              />
                              {errors.cnpj && touched.cnpj && (
                                <FormFeedback>{errors.cnpj}</FormFeedback>
                              )}
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
                      </>
                    )}

                    {/* Dados de Contato e Detalhes Adicionais */}
                    <Row>
                      <Col md={3}>
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
                      <Col md={3}>
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
                          </Field>
                          {errors.email && touched.email && (
                            <FormFeedback>{errors.email}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>                      <Col md={3}>
                        <FormGroup>
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
                      {values.tipoPessoa === 'F' && (
                        <Col md={3}>
                          <FormGroup>
                            <Label for="rg">RG</Label>
                            <Field name="rg">
                              {({ field, meta }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  id="rg"
                                  invalid={meta.error && meta.touched}
                                  placeholder="RG"
                                />
                              )}
                            </Field>
                            {errors.rg && touched.rg && (
                              <FormFeedback>{errors.rg}</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>
                      )}
                    </Row>
                      {/* Informações Pessoais Adicionais */}
                    {values.tipoPessoa === 'F' && (
                      <Row className="mt-3">
                        <Col md={4}>
                          <FormGroup>
                            <Label for="dataNascimento">Data de Nascimento</Label>
                            <Input
                              type="date"
                              id="dataNascimento"
                              name="dataNascimento"
                              value={values.dataNascimento ? new Date(values.dataNascimento).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                setFieldValue('dataNascimento', e.target.value ? new Date(e.target.value) : null);
                              }}
                              invalid={errors.dataNascimento && touched.dataNascimento}
                              placeholder="DD/MM/AAAA"
                            />
                            {errors.dataNascimento && touched.dataNascimento && (
                              <FormFeedback>{errors.dataNascimento}</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="estadoCivil">Estado Civil</Label>
                            <Input
                              type="select"
                              id="estadoCivil"
                              name="estadoCivil"
                              value={values.estadoCivil || ''}
                              onChange={(e) => setFieldValue('estadoCivil', e.target.value)}
                            >
                              <option value="">Selecione...</option>
                              <option value="Solteiro(a)">Solteiro(a)</option>
                              <option value="Casado(a)">Casado(a)</option>
                              <option value="Divorciado(a)">Divorciado(a)</option>
                              <option value="Viúvo(a)">Viúvo(a)</option>
                              <option value="União Estável">União Estável</option>
                              <option value="Separado(a)">Separado(a)</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="sexo">Sexo</Label>
                            <Input
                              type="select"
                              id="sexo"
                              name="sexo"
                              value={values.sexo || ''}
                              onChange={(e) => setFieldValue('sexo', e.target.value)}
                            >
                              <option value="">Selecione...</option>
                              <option value="M">Masculino</option>
                              <option value="F">Feminino</option>
                              <option value="O">Outro</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                    
                    {/* Separação para ambos os tipos */}
                    {values.tipoPessoa === 'J' && (
                      <Row className="mt-3">
                        <Col md={12}>
                          <div className="py-2"></div>
                        </Col>
                      </Row>
                    )}

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
                                  setFieldValue('limiteCredito', '0,00');
                                }
                              }}
                              invalid={errors.limiteCredito && touched.limiteCredito}
                              placeholder="0,00"
                            />
                          </InputGroup>
                          {errors.limiteCredito && touched.limiteCredito && (
                            <FormFeedback>{errors.limiteCredito}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="limiteCredito2">Limite de Crédito Emergencial</Label>
                          <InputGroup>
                            <InputGroupText style={{ background: '#0d6efd', color: 'white', border: 'none', fontWeight: 500 }}>R$</InputGroupText>
                            <Input
                              type="text"
                              id="limiteCredito2"
                              name="limiteCredito2"
                              value={values.limiteCredito2}
                              onChange={(e) => {
                                const apenasNumeros = e.target.value.replace(/\D/g, '');
                                if (apenasNumeros) {
                                  const valorDecimal = parseFloat(apenasNumeros) / 100;
                                  const valorFormatado = formatarMoeda(valorDecimal);
                                  setFieldValue('limiteCredito2', valorFormatado);
                                } else {
                                  setFieldValue('limiteCredito2', '0,00');
                                }
                              }}
                              invalid={errors.limiteCredito2 && touched.limiteCredito2}
                              placeholder="0,00"
                            />
                          </InputGroup>
                          {errors.limiteCredito2 && touched.limiteCredito2 && (
                            <FormFeedback>{errors.limiteCredito2}</FormFeedback>
                          )}
                        </FormGroup>                      </Col>
                    </Row>
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
                                invalid={errors.condicaoPagamentoId && touched.condicaoPagamentoId}
                              />
                              <Input
                                type="hidden"
                                name="condicaoPagamentoId"
                                id="condicaoPagamentoId"
                                value={values.condicaoPagamentoId || ''}
                              />
                            </div>                            <SearchButton
                              onClick={() => setCondicaoPagamentoModalOpen(true)}
                            />
                          </div>
                          {errors.condicaoPagamentoId && touched.condicaoPagamentoId && (
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
                            invalid={errors.cep && touched.cep}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {errors.cep && touched.cep && (
                            <FormFeedback>{errors.cep}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>                    {/* Cidade */}
                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Label for="cidade">Cidade</Label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flexGrow: 1 }}>
                              <Input
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
                                invalid={errors.cidadeId && touched.cidadeId}
                              />
                            </div>                            <SearchButton
                              onClick={() => setCidadeModalOpen(true)}
                            />
                          </div>
                          {errors.cidadeId && touched.cidadeId && (
                            <FormFeedback style={{ display: 'block' }}>
                              {errors.cidadeId}
                            </FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>{/* Seção de Observações */}
                    <Row className="mt-3">
                      <Col md={12}>
                        <h5 className="text-primary mb-3">Observações</h5>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Field name="observacao">
                            {({ field }) => (
                              <Input
                                {...field}
                                type="textarea"
                                id="observacao"
                                rows={4}
                                placeholder="Adicione observações sobre o cliente"
                                style={{ minHeight: '100px' }}
                                invalid={errors.observacao && touched.observacao}
                              />
                            )}
                          </Field>
                          {errors.observacao && touched.observacao && (
                            <FormFeedback>{errors.observacao}</FormFeedback>
                          )}                        </FormGroup>
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
                              checked={values.ativo === true}
                              onChange={e => setFieldValue('ativo', e.target.checked)}
                            />
                            <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                              Ativo <span style={{ fontWeight: 400 }}>
                                {values.ativo === true ? (
                                  <span className="text-success">(Registro Ativo)</span>
                                ) : (
                                  <span className="text-danger">(Registro Inativo)</span>
                                )}
                              </span>
                            </Label>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Botões */}                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting}
                        className="me-2"
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
                        onClick={() => navigate('/clientes')}
                        disabled={isSubmitting}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Cancelar
                      </Button>
                    </div>
                  </Form>
                );                }}
              </Formik>
            </CardBody>
          </Card>
          
          {/* Modal de seleção de cidade */}
          <CidadeSearchModal
            isOpen={cidadeModalOpen}
            toggle={() => setCidadeModalOpen(!cidadeModalOpen)}
            onSelect={async (cidade) => {
          try {
            // Buscar a cidade completa com informações detalhadas
            if (cidade && cidade.id) {              // Buscar a cidade completa com informações detalhadas
              const cidadeResponse = await axios.get(`/api/Cidade/${cidade.id}`);
              const cidadeCompleta = cidadeResponse.data;
              console.log("Cidade completa recebida:", cidadeCompleta);
              setCidadeSelecionada(cidadeCompleta);
            } else {
              setCidadeSelecionada(cidade);
            }
            setCidadeModalOpen(false);
            // O useEffect acima vai cuidar de atualizar via formikRef
          } catch (error) {
            console.error("Erro ao buscar detalhes da cidade:", error);
            setCidadeSelecionada(cidade);
            setCidadeModalOpen(false);
          }
        }}
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

export default ClienteForm;
