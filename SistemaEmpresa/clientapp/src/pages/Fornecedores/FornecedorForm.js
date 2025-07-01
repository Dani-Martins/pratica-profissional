import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col, Nav, NavItem, NavLink,
  TabContent, TabPane, Modal, ModalHeader, ModalBody, ModalFooter, FormText
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faArrowLeft, faTimes, faIdCard, 
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Schema de validação
const FornecedorSchema = Yup.object().shape({
  tipoPessoa: Yup.string()
    .required('Tipo de pessoa é obrigatório')
    .oneOf(['F', 'J'], 'Tipo de pessoa deve ser F ou J'),
    
  // Campos para pessoa física (validados apenas quando tipoPessoa === 'F')
  nome: Yup.string()
    .when('tipoPessoa', {
      is: 'F',
      then: Yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
    }),
  cpf: Yup.string()
    .when('tipoPessoa', {
      is: 'F',
      then: Yup.string()
        .required('CPF é obrigatório')
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido, use o formato 000.000.000-00')
    }),
    
  // Campos para pessoa jurídica (validados apenas quando tipoPessoa === 'J')
  razaoSocial: Yup.string()
    .when('tipoPessoa', {
      is: 'J',
      then: Yup.string()
        .required('Razão Social é obrigatória')
        .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
        .max(100, 'Razão Social deve ter no máximo 100 caracteres')
    }),
  nomeFantasia: Yup.string()
    .max(100, 'Nome fantasia deve ter no máximo 100 caracteres'),
  cnpj: Yup.string()
    .when('tipoPessoa', {
      is: 'J',
      then: Yup.string()
        .required('CNPJ é obrigatório')
        .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido, use o formato 00.000.000/0000-00')
    }),
    
  // Campos comuns para ambos os tipos
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  telefone: Yup.string()
    .required('Telefone é obrigatório'),
  contato: Yup.string()
    .max(255, 'Contato deve ter no máximo 255 caracteres'),
  endereco: Yup.object().shape({
    logradouro: Yup.string().required('Logradouro é obrigatório'),
    numero: Yup.string().required('Número é obrigatório'),
    bairro: Yup.string().required('Bairro é obrigatório'),
    cidadeId: Yup.string().required('Cidade é obrigatória'),
    cep: Yup.string().required('CEP é obrigatório')
  })
}).test('conditional-validation', null, function(values) {
  // Validação personalizada para garantir que os campos específicos de cada tipo de pessoa sejam preenchidos
  const errors = {};
  
  if (values.tipoPessoa === 'F') {
    if (!values.nome) errors.nome = 'Nome é obrigatório';
    if (!values.cpf) errors.cpf = 'CPF é obrigatório';
  } else if (values.tipoPessoa === 'J') {
    if (!values.razaoSocial) errors.razaoSocial = 'Razão Social é obrigatória';
    if (!values.cnpj) errors.cnpj = 'CNPJ é obrigatório';
  }
  
  return Object.keys(errors).length > 0 ? new Yup.ValidationError(errors) : true;
});

const FornecedorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [initialValues, setInitialValues] = useState({
    tipoPessoa: 'J', // F = Física, J = Jurídica
    nome: '', // Para pessoa física
    cpf: '', // Para pessoa física
    razaoSocial: '',  
    nomeFantasia: '',
    cnpj: '', // Para pessoa jurídica
    email: '',
    telefone: '',
    contato: '', // Adicionando campo de contato
    observacoes: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidadeId: '',
      cep: ''
    },
    ativo: true
  });
  const [error, setError] = useState(null);
  
  // Estados para cidades e modais relacionados
  const [cidades, setCidades] = useState([]);
  const [estadosModal, setEstadosModal] = useState([]);
  const [paisesModal, setPaisesModal] = useState([]);

  // Estados para modais
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showPaisModal, setShowPaisModal] = useState(false);

  // Estados para novos registros
  const [novaCidade, setNovaCidade] = useState({ nome: '', estadoId: '', codigoIBGE: '' });
  const [novoEstado, setNovoEstado] = useState({ nome: '', uf: '', paisId: '' });
  const [novoPais, setNovoPais] = useState({ nome: '', sigla: '', codigo: '' });

  // Estados para loading e erros dos modais
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [loadingEstadoModal, setLoadingEstadoModal] = useState(false);
  const [errorEstadoModal, setErrorEstadoModal] = useState(null);
  const [loadingPaisModal, setLoadingPaisModal] = useState(false);
  const [errorPaisModal, setErrorPaisModal] = useState(null);
  
  useEffect(() => {
    // Carregar dados do fornecedor para edição
    const fetchFornecedor = async () => {
      if (id) {
        try {
          setLoading(true);
          
          // Código similar para buscar dados reais de fornecedores
          const response = await axios.get(`/api/Fornecedor/${id}`);
          const fornecedorData = response.data;
          setInitialValues({
            tipoPessoa: fornecedorData.tipoPessoa || 'J',
            nome: fornecedorData.nome || '',
            cpf: fornecedorData.cpf || '',
            razaoSocial: fornecedorData.razaoSocial || '',
            nomeFantasia: fornecedorData.nomeFantasia || '',
            cnpj: fornecedorData.cnpj || '',
            email: fornecedorData.email || '',
            telefone: fornecedorData.telefone || '',
            contato: fornecedorData.contato || '',
            endereco: {
              logradouro: fornecedorData.endereco?.logradouro || '',
              numero: fornecedorData.endereco?.numero || '',
              complemento: fornecedorData.endereco?.complemento || '',
              bairro: fornecedorData.endereco?.bairro || '',
              cidadeId: fornecedorData.endereco?.cidadeId || '',
              cep: fornecedorData.endereco?.cep || ''
            },
            ativo: fornecedorData.ativo !== false
          });
          
        } catch (err) {
          console.error('Erro ao carregar fornecedor:', err);
          setError('Erro ao carregar dados do fornecedor: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFornecedor();
  }, [id]);
  
  // Carregar cidades, estados e países
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const cidadesResponse = await axios.get('/api/Cidade');
        setCidades(cidadesResponse.data);
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
      }
    };
    
    carregarDados();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Log detalhado dos valores sendo enviados
      console.log('Dados do fornecedor antes da formatação:', JSON.stringify(values, null, 2));
      
      // Formatar dados de acordo com o que a API espera
      const fornecedorDTO = {
        tipoPessoa: values.tipoPessoa || 'J',
        nome: values.nome || "",
        cpf: values.cpf ? values.cpf.replace(/\D/g, '') : "",
        razaoSocial: values.razaoSocial || "",
        nomeFantasia: values.nomeFantasia || "",
        cnpj: values.cnpj ? values.cnpj.replace(/\D/g, '') : "",
        email: values.email || "",
        telefone: values.telefone || "",
        contato: values.contato || "",
        observacoes: values.observacoes || "",
        ativo: Boolean(values.ativo)
      };
      
      // Tratar o endereço separadamente
      if (values.endereco) {
        // Adicionar os campos de endereço diretamente ao fornecedorDTO
        fornecedorDTO.logradouro = values.endereco.logradouro;
        fornecedorDTO.numero = values.endereco.numero;
        fornecedorDTO.complemento = values.endereco.complemento || "";
        fornecedorDTO.bairro = values.endereco.bairro;
        fornecedorDTO.cep = values.endereco.cep;
        
        // Garantir que cidadeId seja um número válido
        const cidadeId = parseInt(values.endereco.cidadeId, 10);
        if (!isNaN(cidadeId)) {
          fornecedorDTO.cidadeId = cidadeId;
        } else {
          throw new Error("ID de cidade inválido");
        }
      }
      
      console.log('Dados formatados para envio:', fornecedorDTO);
      
      if (id) {
        // Para atualizar um fornecedor existente
        await axios.put(`/api/Fornecedor/${id}`, fornecedorDTO);
        console.log('Fornecedor atualizado com sucesso');
      } else {
        // Para criar um novo fornecedor
        await axios.post('/api/Fornecedor', fornecedorDTO);
        console.log('Fornecedor criado com sucesso');
      }
      
      // Navegar após conclusão bem-sucedida
      navigate('/fornecedores');
    } catch (err) {
      console.error('Erro completo:', err);
      
      // Mostrar detalhes mais específicos do erro
      if (err.response) {
        console.error('Error response completa:', JSON.stringify(err.response.data, null, 2));
        
        // Tratar erro específico de CNPJ inválido
        if (err.response.status === 500 && err.response.data?.erro === "CNPJ inválido") {
          setError(`Erro: CNPJ inválido. Por favor, verifique o número do CNPJ informado.`);
        } else if (err.response.data?.errors) {
          console.error('Erros de validação específicos:', JSON.stringify(err.response.data.errors, null, 2));
          
          // Mostrar erros específicos na UI
          const errorMessages = Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          
          setError(`Erro de validação:\n${errorMessages}`);
        } else {
          setError(`Erro ${err.response.status}: ${err.response.data?.title || 'Erro desconhecido'}`);
        }
      } else {
        setError('Erro ao salvar fornecedor: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const toggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }
  
  // Função para carregar estados para o modal de cidade
  const carregarEstados = async () => {
    try {
      setLoadingModal(true);
      const response = await axios.get('/api/Estado');
      setEstadosModal(response.data);
      
      if (!response.data || response.data.length === 0) {
        setErrorModal('Nenhum estado encontrado. Por favor, adicione um estado primeiro.');
      } else {
        setErrorModal(null);
      }
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
      setErrorModal('Não foi possível carregar a lista de estados: ' + 
                   (err.response?.data?.message || err.message));
    } finally {
      setLoadingModal(false);
    }
  };

  // Função para carregar países para o modal de estado
  const carregarPaises = async () => {
    try {
      setLoadingEstadoModal(true);
      const response = await axios.get('/api/Pais');
      console.log('Países carregados para o modal:', response.data);
      setPaisesModal(response.data);
      
      if (!response.data || response.data.length === 0) {
        setErrorEstadoModal('Nenhum país encontrado. Por favor, adicione um país primeiro.');
      } else {
        setErrorEstadoModal(null);
      }
    } catch (err) {
      console.error('Erro ao carregar países:', err);
      setErrorEstadoModal('Não foi possível carregar a lista de países: ' + 
                         (err.response?.data?.message || err.message));
    } finally {
      setLoadingEstadoModal(false);
    }
  };

  // Funções para abrir modais
  const abrirModalCidade = () => {
    setNovaCidade({ nome: '', estadoId: '', codigoIBGE: '' });
    setErrorModal(null);
    carregarEstados();
    setShowCidadeModal(true);
  };

  const abrirModalEstado = () => {
    console.log('Abrindo modal de estado');
    // Garantir que todos os campos sejam inicializados com valores apropriados
    setNovoEstado({
      nome: '',
      uf: '',
      paisId: '' // String vazia para o select
    });
    setErrorEstadoModal(null);
    carregarPaises();
    setShowEstadoModal(true);
  };

  const abrirModalPais = () => {
    setNovoPais({ nome: '', sigla: '', codigo: '' });
    setErrorPaisModal(null);
    setShowPaisModal(true);
  };

  // Handlers para mudança de valores
  const handleNovaCidadeChange = (e) => {
    const { name, value } = e.target;
    setNovaCidade(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNovoEstadoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'paisId') {
      // Problema: paisId possivelmente não está sendo convertido corretamente
      // Solução: Garantir que seja tratado como número e fazer log para depuração
      const paisIdValue = value === '' ? '' : Number(value);
      console.log(`Selecionando país ID: ${value} → ${paisIdValue} (${typeof paisIdValue})`);
      
      setNovoEstado(prev => ({
        ...prev,
        [name]: paisIdValue
      }));
    } else if (name === 'uf') {
      setNovoEstado(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setNovoEstado(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNovoPaisChange = (e) => {
    const { name, value } = e.target;
    setNovoPais(prev => ({
      ...prev,
      [name]: name === 'sigla' ? value.toUpperCase() : value
    }));
  };

  // Verificadores de dados existentes
  const verificarEstadoExistente = async (nome, uf) => {
    try {
      const response = await axios.get('/api/Estado');
      const estados = response.data;
      
      const estadoExistente = estados.find(e => 
        e.nome.toUpperCase() === nome.toUpperCase() || 
        e.uf.toUpperCase() === uf.toUpperCase()
      );
      
      return estadoExistente;
    } catch (err) {
      console.error('Erro ao verificar estado existente:', err);
      return null;
    }
  };

  const verificarPaisExistente = async (nome, sigla) => {
    try {
      const response = await axios.get('/api/Pais');
      const paises = response.data;
      
      const paisExistente = paises.find(p => 
        p.nome.toUpperCase() === nome.toUpperCase() || 
        p.sigla.toUpperCase() === sigla.toUpperCase()
      );
      
      return paisExistente;
    } catch (err) {
      console.error('Erro ao verificar país existente:', err);
      return null;
    }
  };

  // Funções para salvar dados
  const salvarNovaCidade = async () => {
    if (!novaCidade.nome || !novaCidade.estadoId) {
      setErrorModal('Nome e Estado são campos obrigatórios.');
      return;
    }
    
    setLoadingModal(true);
    setErrorModal(null);
    
    try {
      const response = await axios.post('/api/Cidade', novaCidade);
      const cidadeAdicionada = response.data;
      
      // Atualizar lista de cidades
      setCidades(prev => [...prev, cidadeAdicionada]);
      
      // Fechar modal e limpar form
      setShowCidadeModal(false);
      setNovaCidade({ nome: '', estadoId: '', codigoIBGE: '' });
      
      // Se estiver sendo usado pelo Formik, atualizar o valor
      // formikProps.setFieldValue('endereco.cidadeId', cidadeAdicionada.id);
    } catch (err) {
      console.error('Erro ao salvar cidade:', err);
      setErrorModal('Erro ao salvar cidade: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingModal(false);
    }
  };

  const salvarNovoEstado = async () => {
    console.log('Tentando salvar estado:', novoEstado);
    console.log('Tipo do paisId:', typeof novoEstado.paisId);
    
    // Validação mais robusta que considera 0 como valor válido para paisId
    if (!novoEstado.nome || !novoEstado.uf || 
        (novoEstado.paisId === undefined || novoEstado.paisId === null || novoEstado.paisId === '')) {
      
      console.log('Validação falhou:', {
        nome: !novoEstado.nome ? 'faltando' : 'ok',
        uf: !novoEstado.uf ? 'faltando' : 'ok',
        paisId: (novoEstado.paisId === undefined || novoEstado.paisId === null || novoEstado.paisId === '') 
                ? 'faltando' : 'ok'
      });
      
      setErrorEstadoModal('Nome, UF e País são campos obrigatórios.');
      return;
    }
    
    if (novoEstado.uf.length !== 2) {
      setErrorEstadoModal('UF deve conter exatamente 2 caracteres.');
      return;
    }
    
    setLoadingEstadoModal(true);
    setErrorEstadoModal(null);
    
    try {
      // Verificar se o estado já existe
      const estadoExistente = await verificarEstadoExistente(novoEstado.nome, novoEstado.uf);
      if (estadoExistente) {
        if (estadoExistente.nome.toUpperCase() === novoEstado.nome.toUpperCase()) {
          setErrorEstadoModal(`Já existe um estado com o nome "${novoEstado.nome}".`);
        } else {
          setErrorEstadoModal(`Já existe um estado com a UF "${novoEstado.uf}".`);
        }
        setLoadingEstadoModal(false);
        return;
      }
      
      const dadosEstado = {
        nome: novoEstado.nome.toUpperCase(),
        uf: novoEstado.uf.toUpperCase(),
        paisId: parseInt(novoEstado.paisId, 10)
      };
      
      const response = await axios.post('/api/Estado', dadosEstado);
      const estadoAdicionado = response.data;
      
      // Atualizar lista de estados no modal de cidade
      setEstadosModal(prev => [...prev, estadoAdicionado]);
      
      // Fechar modal e limpar form
      setShowEstadoModal(false);
      setNovoEstado({ nome: '', uf: '', paisId: '' });
      
      // Selecionar o novo estado no modal de cidade
      setNovaCidade(prev => ({
        ...prev,
        estadoId: estadoAdicionado.id
      }));
    } catch (err) {
      console.error('Erro ao salvar estado:', err);
      setErrorEstadoModal('Erro ao salvar estado: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingEstadoModal(false);
    }
  };

  const salvarNovoPais = async () => {
    if (!novoPais.nome || !novoPais.sigla) {
      setErrorPaisModal('Nome e Sigla são campos obrigatórios.');
      return;
    }
    
    setLoadingPaisModal(true);
    setErrorPaisModal(null);
    
    try {
      // Verificar se o país já existe
      const paisExistente = await verificarPaisExistente(novoPais.nome, novoPais.sigla);
      if (paisExistente) {
        if (paisExistente.nome.toUpperCase() === novoPais.nome.toUpperCase()) {
          setErrorPaisModal(`Já existe um país com o nome "${novoPais.nome}".`);
        } else {
          setErrorPaisModal(`Já existe um país com a sigla "${novoPais.sigla}".`);
        }
        setLoadingPaisModal(false);
        return;
      }
      
      const response = await axios.post('/api/Pais', {
        nome: novoPais.nome.toUpperCase(),
        sigla: novoPais.sigla.toUpperCase(),
        codigo: novoPais.codigo
      });
      
      const paisAdicionado = response.data;
      
      // Atualizar lista de países no modal de estado
      setPaisesModal(prev => [...prev, paisAdicionado]);
      
      // Fechar modal e limpar form
      setShowPaisModal(false);
      setNovoPais({ nome: '', sigla: '', codigo: '' });
      
      // Selecionar o novo país no modal de estado
      setNovoEstado(prev => ({
        ...prev,
        paisId: paisAdicionado.id
      }));
    } catch (err) {
      console.error('Erro ao salvar país:', err);
      setErrorPaisModal('Erro ao salvar país: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingPaisModal(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do fornecedor...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>{id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
      </div>
      
      {error && <Alert color="danger" fade={true} timeout={300}>{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={FornecedorSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <Nav tabs className="mb-4">
                  <NavItem>
                    <NavLink
                      className={activeTab === '1' ? 'active' : ''}
                      onClick={() => toggle('1')}
                    >
                      <FontAwesomeIcon icon={faIdCard} className="me-2" />
                      Dados Gerais
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '2' ? 'active' : ''}
                      onClick={() => toggle('2')}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      Endereço
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <Row className="mb-3">
                      <Col md={4}>
                        <FormGroup tag="fieldset">
                          <Label>Tipo de Pessoa*</Label>
                          <div className="d-flex">
                            <FormGroup check className="me-4">
                              <Input
                                type="radio"
                                name="tipoPessoa"
                                id="tipoPessoaF"
                                value="F"
                                checked={values.tipoPessoa === 'F'}
                                onChange={handleChange}
                              />
                              <Label check for="tipoPessoaF">Pessoa Física</Label>
                            </FormGroup>
                            <FormGroup check>
                              <Input
                                type="radio"
                                name="tipoPessoa"
                                id="tipoPessoaJ"
                                value="J"
                                checked={values.tipoPessoa === 'J'}
                                onChange={handleChange}
                              />
                              <Label check for="tipoPessoaJ">Pessoa Jurídica</Label>
                            </FormGroup>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Campos para Pessoa Física */}
                    {values.tipoPessoa === 'F' && (
                      <Row>
                        <Col md={8}>
                          <FormGroup>
                            <Label for="nome">Nome Completo*</Label>
                            <Input
                              type="text"
                              name="nome"
                              id="nome"
                              maxLength={100}
                              value={values.nome}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.nome && !!errors.nome}
                            />
                            {touched.nome && errors.nome && <FormText color="danger">{errors.nome}</FormText>}
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="cpf">CPF*</Label>
                            <Input
                              type="text"
                              name="cpf"
                              id="cpf"
                              maxLength={14}
                              placeholder="000.000.000-00"
                              value={values.cpf}
                              onChange={(e) => {
                                // Formatar CPF automaticamente (000.000.000-00)
                                const value = e.target.value;
                                const cpfFormatado = value
                                  .replace(/\D/g, '')
                                  .replace(/^(\d{3})(\d)/, '$1.$2')
                                  .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                                  .replace(/\.(\d{3})(\d)/, '.$1-$2')
                                  .substring(0, 14);
                                
                                handleChange({
                                  target: {
                                    name: 'cpf',
                                    value: cpfFormatado
                                  }
                                });
                              }}
                              onBlur={handleBlur}
                              invalid={touched.cpf && !!errors.cpf}
                            />
                            {touched.cpf && errors.cpf && <FormText color="danger">{errors.cpf}</FormText>}
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                    
                    {/* Campos para Pessoa Jurídica */}
                    {values.tipoPessoa === 'J' && (
                      <>
                        <Row>
                          <Col md={8}>
                            <FormGroup>
                              <Label for="razaoSocial">Razão Social*</Label>
                              <Input
                                type="text"
                                name="razaoSocial"
                                id="razaoSocial"
                                maxLength={100}
                                value={values.razaoSocial}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={touched.razaoSocial && !!errors.razaoSocial}
                              />
                              {touched.razaoSocial && errors.razaoSocial && (
                                <div className="text-danger">{errors.razaoSocial}</div>
                              )}
                            </FormGroup>
                          </Col>
                          
                          <Col md={4}>
                            <FormGroup>
                              <Label for="cnpj">CNPJ*</Label>
                              <Input
                                type="text"
                                name="cnpj"
                                id="cnpj"
                                maxLength={18}
                                value={values.cnpj}
                                onChange={(e) => {
                                  // Formatar CNPJ automaticamente (xx.xxx.xxx/xxxx-xx)
                                  const value = e.target.value;
                                  const cnpjFormatado = value
                                    .replace(/\D/g, '')
                                    .replace(/^(\d{2})(\d)/, '$1.$2')
                                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                                    .replace(/(\d{4})(\d)/, '$1-$2')
                                    .substring(0, 18);
                                  
                                  handleChange({
                                    target: {
                                      name: 'cnpj',
                                      value: cnpjFormatado
                                    }
                                  });
                                }}
                                onBlur={handleBlur}
                                invalid={touched.cnpj && !!errors.cnpj}
                              />
                              {touched.cnpj && errors.cnpj && (
                                <div className="text-danger">{errors.cnpj}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        
                        {/* ADICIONAR ESTA NOVA LINHA: Campo Nome Fantasia */}
                        <Row>
                          <Col md={12}>
                            <FormGroup>
                              <Label for="nomeFantasia">Nome Fantasia</Label>
                              <Input
                                type="text"
                                name="nomeFantasia"
                                id="nomeFantasia"
                                maxLength={100}
                                value={values.nomeFantasia}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={touched.nomeFantasia && !!errors.nomeFantasia}
                              />
                              {touched.nomeFantasia && errors.nomeFantasia && (
                                <div className="text-danger">{errors.nomeFantasia}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                      </>
                    )}
                    
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="telefone">Telefone*</Label>
                          <Input
                            type="text"
                            name="telefone"
                            id="telefone"
                            value={values.telefone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.telefone && !!errors.telefone}
                          />
                          {touched.telefone && errors.telefone && (
                            <div className="text-danger">{errors.telefone}</div>
                          )}
                        </FormGroup>
                      </Col>
                      
                      <Col md={6}>
                        <FormGroup>
                          <Label for="contato">Contato</Label>
                          <Input
                            type="text"
                            name="contato"
                            id="contato"
                            value={values.contato || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Label for="email">Email*</Label>
                          <Input
                            type="email"
                            name="email"
                            id="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.email && !!errors.email}
                          />
                          {touched.email && errors.email && (
                            <div className="text-danger">{errors.email}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <FormGroup>
                      <Label for="observacoes">Observações</Label>
                      <Input
                        type="textarea"
                        name="observacoes"
                        id="observacoes"
                        rows={3}
                        value={values.observacoes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>                    
                    <FormGroup check className="mb-4 mt-2">
                      <div className="form-check form-switch">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="ativo"
                          role="switch"
                          name="ativo"
                          checked={values.ativo === true}
                          onChange={(e) => setFieldValue('ativo', e.target.checked)}
                        />
                        <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                          Ativo <span style={{ fontWeight: 400 }}>
                            {values.ativo === true ? 
                              <span className="text-success">(Registro Ativo)</span> : 
                              <span className="text-danger">(Registro Inativo)</span>}
                          </span>
                        </Label>
                      </div>
                    </FormGroup>
                  </TabPane>
                  
                  <TabPane tabId="2">
                    <Row>
                      <Col md={8}>
                        <FormGroup>
                          <Label for="endereco.logradouro">Logradouro*</Label>
                          <Input
                            type="text"
                            name="endereco.logradouro"
                            id="endereco.logradouro"
                            value={values.endereco.logradouro}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.endereco?.logradouro && !!errors.endereco?.logradouro}
                          />
                          {touched.endereco?.logradouro && errors.endereco?.logradouro && (
                            <div className="text-danger">{errors.endereco.logradouro}</div>
                          )}
                        </FormGroup>
                      </Col>
                      
                      <Col md={4}>
                        <FormGroup>
                          <Label for="endereco.numero">Número*</Label>
                          <Input
                            type="text"
                            name="endereco.numero"
                            id="endereco.numero"
                            value={values.endereco.numero}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.endereco?.numero && !!errors.endereco?.numero}
                          />
                          {touched.endereco?.numero && errors.endereco?.numero && (
                            <div className="text-danger">{errors.endereco.numero}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="endereco.complemento">Complemento</Label>
                          <Input
                            type="text"
                            name="endereco.complemento"
                            id="endereco.complemento"
                            value={values.endereco.complemento}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      
                      <Col md={8}>
                        <FormGroup>
                          <Label for="endereco.bairro">Bairro*</Label>
                          <Input
                            type="text"
                            name="endereco.bairro"
                            id="endereco.bairro"
                            value={values.endereco.bairro}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.endereco?.bairro && !!errors.endereco?.bairro}
                          />
                          {touched.endereco?.bairro && errors.endereco?.bairro && (
                            <div className="text-danger">{errors.endereco.bairro}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="endereco.cep">CEP*</Label>
                          <Input
                            type="text"
                            name="endereco.cep"
                            id="endereco.cep"
                            value={values.endereco.cep}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.endereco?.cep && !!errors.endereco?.cep}
                          />
                          {touched.endereco?.cep && errors.endereco?.cep && (
                            <div className="text-danger">{errors.endereco.cep}</div>
                          )}
                        </FormGroup>
                      </Col>
                      
                      <Col md={8}>
                        <FormGroup>
                          <Label for="endereco.cidadeId">Cidade*</Label>
                          <div className="d-flex">
                            <Input
                              type="select"
                              name="endereco.cidadeId"
                              id="endereco.cidadeId"
                              value={values.endereco.cidadeId || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              invalid={touched.endereco?.cidadeId && !!errors.endereco?.cidadeId}
                              className="me-2 flex-grow-1"
                            >
                              <option value="">Selecione uma cidade...</option>
                              {cidades.map(cidade => (
                                <option key={cidade.id} value={cidade.id}>
                                  {cidade.nome} - {cidade.estado?.uf || ''}
                                </option>
                              ))}
                            </Input>
                            <Button 
                              color="secondary"
                              onClick={abrirModalCidade}
                              title="Adicionar nova cidade"
                              size="sm"
                            >
                              + Nova
                            </Button>
                          </div>
                          {touched.endereco?.cidadeId && errors.endereco?.cidadeId && (
                            <div className="text-danger">{errors.endereco.cidadeId}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  </TabPane>
                </TabContent>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button 
                    type="submit" 
                    color="primary" 
                    disabled={isSubmitting}
                    className="me-2"
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
                    onClick={() => navigate('/fornecedores')}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancelar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      
      {/* Modal para Adicionar Nova Cidade */}
      <Modal isOpen={showCidadeModal} toggle={() => setShowCidadeModal(false)}>
        <ModalHeader toggle={() => setShowCidadeModal(false)}>
          Adicionar Nova Cidade
        </ModalHeader>
        <ModalBody>
          {errorModal && <Alert color="danger" fade={true} timeout={300}>{errorModal}</Alert>}
          
          <FormGroup>
            <Label for="nome">Nome da Cidade*</Label>
            <Input
              type="text"
              name="nome"
              id="nome"
              value={novaCidade.nome}
              onChange={handleNovaCidadeChange}
              placeholder="Nome da cidade"
            />
          </FormGroup>
          
          {/* Estado com botão para adicionar novo */}
          <FormGroup>
            <Label for="estadoId">Estado*</Label>
            <div className="d-flex">
              <Input
                type="select"
                name="estadoId"
                id="estadoId"
                value={novaCidade.estadoId}
                onChange={handleNovaCidadeChange}
                className="me-2 flex-grow-1"
              >
                <option value="">Selecione um estado...</option>
                {estadosModal.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nome} ({estado.uf})
                  </option>
                ))}
              </Input>
              <Button 
                color="secondary"
                onClick={abrirModalEstado}
                title="Adicionar novo estado"
                size="sm"
              >
                + Novo
              </Button>
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label for="codigoIBGE">Código IBGE</Label>
            <Input
              type="text"
              name="codigoIBGE"
              id="codigoIBGE"
              value={novaCidade.codigoIBGE}
              onChange={handleNovaCidadeChange}
              placeholder="Código IBGE (opcional)"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={salvarNovaCidade} disabled={loadingModal}>
            {loadingModal ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
          <Button color="secondary" onClick={() => setShowCidadeModal(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal para Adicionar Novo Estado */}
      <Modal isOpen={showEstadoModal} toggle={() => setShowEstadoModal(false)}>
        <ModalHeader toggle={() => setShowEstadoModal(false)}>
          Adicionar Novo Estado
        </ModalHeader>
        <ModalBody>
          {errorEstadoModal && <Alert color="danger" fade={true} timeout={300}>{errorEstadoModal}</Alert>}
          
          <FormGroup>
            <Label for="nomeEstado">Nome do Estado*</Label>
            <Input
              type="text"
              name="nome"
              id="nomeEstado"
              value={novoEstado.nome}
              onChange={handleNovoEstadoChange}
              placeholder="Nome do estado"
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="ufEstado">UF*</Label>
            <Input
              type="text"
              name="uf"
              id="ufEstado"
              value={novoEstado.uf}
              onChange={handleNovoEstadoChange}
              placeholder="Ex: SP, RJ, MG"
              maxLength={2}
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="paisId">País*</Label>
            <div className="d-flex">
              <Input
                type="select"
                name="paisId"
                id="paisId"
                value={novoEstado.paisId}
                onChange={handleNovoEstadoChange}
                className="me-2 flex-grow-1"
                invalid={!paisesModal || paisesModal.length === 0}
              >
                {!paisesModal || paisesModal.length === 0 ? (
                  <option value="">Nenhum país disponível</option>
                ) : (
                  <>
                    <option value="">Selecione um país...</option>
                    {paisesModal.map(pais => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nome} ({pais.sigla})
                      </option>
                    ))}
                  </>
                )}
              </Input>
              <Button 
                color="secondary"
                onClick={abrirModalPais}
                title="Adicionar novo país"
                size="sm"
              >
                + Novo
              </Button>
            </div>
            {(!paisesModal || paisesModal.length === 0) && (
              <FormText color="muted">
                Não há países cadastrados. Clique em "+ Novo" para adicionar.
              </FormText>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={salvarNovoEstado} disabled={loadingEstadoModal}>
            {loadingEstadoModal ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
          <Button color="secondary" onClick={() => setShowEstadoModal(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal para Adicionar Novo País */}
      <Modal isOpen={showPaisModal} toggle={() => setShowPaisModal(false)}>
        <ModalHeader toggle={() => setShowPaisModal(false)}>
          Adicionar Novo País
        </ModalHeader>
        <ModalBody>
          {errorPaisModal && <Alert color="danger" fade={true} timeout={300}>{errorPaisModal}</Alert>}
          
          <FormGroup>
            <Label for="nomePais">Nome do País*</Label>
            <Input
              type="text"
              name="nome"
              id="nomePais"
              value={novoPais.nome}
              onChange={handleNovoPaisChange}
              placeholder="Ex: Brasil, Argentina, etc."
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="siglaPais">Sigla*</Label>
            <Input
              type="text"
              name="sigla"
              id="siglaPais"
              value={novoPais.sigla}
              onChange={handleNovoPaisChange}
              placeholder="Ex: BRA, ARG, etc."
              maxLength={3}
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="codigoPais">Código</Label>
            <Input
              type="text"
              name="codigo"
              id="codigoPais"
              value={novoPais.codigo}
              onChange={handleNovoPaisChange}
              placeholder="Código numérico opcional"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={salvarNovoPais} disabled={loadingPaisModal}>
            {loadingPaisModal ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
          <Button color="secondary" onClick={() => setShowPaisModal(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FornecedorForm;
