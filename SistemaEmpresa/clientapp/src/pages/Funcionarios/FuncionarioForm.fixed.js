import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col, Container, FormFeedback
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faArrowLeft, faSearch,
  faCalendarAlt, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { 
  formatarCPF, 
  formatarCEP, 
  formatarTelefone, 
  formatarMoeda,
  converterMoedaParaNumero,
  formatarCNPJ
} from '../../utils/formatadores';
import EstadoSearchModal from '../Localizacao/Estado/EstadoSearchModal';
import PaisSearchModal from '../Localizacao/Pais/PaisSearchModal';
import CidadeSearchModal from '../Localizacao/Cidade/CidadeSearchModal';

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

// Schema de validação dinâmico baseado no tipo de pessoa
const createValidationSchema = (tipoPessoa) => {
  // Schema base comum para ambos os tipos de pessoa
  const baseSchema = {
    tipoPessoa: Yup.string().required('Tipo de pessoa é obrigatório'),
    cargo: Yup.string().required('Cargo é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    endereco: Yup.string().required('Endereço é obrigatório'),
    numero: Yup.string().required('Número é obrigatório'),
    bairro: Yup.string().required('Bairro é obrigatório'),
    cidadeId: Yup.mixed().required('Cidade é obrigatória')
  };

  if (tipoPessoa === 'F') {
    // Pessoa Física
    return Yup.object().shape({
      ...baseSchema,
      nome: Yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
      cpf: Yup.string()
        .required('CPF é obrigatório')
        .test('cpf-valido', 'CPF inválido', validarCPF)
    });
  } else {
    // Pessoa Jurídica
    return Yup.object().shape({
      ...baseSchema,
      razaoSocial: Yup.string()
        .required('Razão Social é obrigatória')
        .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
        .max(100, 'Razão Social deve ter no máximo 100 caracteres'),
      cnpj: Yup.string()
        .required('CNPJ é obrigatório')
        .test('cnpj-valido', 'CNPJ inválido', validarCNPJ)
    });
  }
};

const FuncionarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const formikRef = React.useRef(null);
  const [tipoPessoaValue, setTipoPessoaValue] = useState('F');
  const [initialValues, setInitialValues] = useState({
    tipoPessoa: 'F',
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    cargo: '',
    dataAdmissao: '',
    salario: 'R$ 0,00',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    observacoes: '',
    ativo: true
  });
  
  // Estado para controle de modais de localização
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [paisSelecionado, setPaisSelecionado] = useState(null);
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [estadoModalOpen, setEstadoModalOpen] = useState(false);
  const [paisModalOpen, setPaisModalOpen] = useState(false);
  
  // Efeito para atualizar o cidadeId quando cidadeSelecionada mudar
  useEffect(() => {
    if (cidadeSelecionada && formikRef.current) {
      formikRef.current.setFieldValue('cidadeId', cidadeSelecionada.id);
    }
  }, [cidadeSelecionada]);

  useEffect(() => {
    // Carregar dados do funcionário para edição
    const fetchFuncionario = async () => {
      if (id) {
        try {
          setLoading(true);
          
          const response = await axios.get(`/api/Funcionario/${id}`);
          const funcionarioData = response.data;
          
          const tipoPessoa = funcionarioData.tipoPessoa || 'F';
          setTipoPessoaValue(tipoPessoa);
          
          setInitialValues({
            tipoPessoa: tipoPessoa,
            nome: funcionarioData.nome || '',
            cpf: funcionarioData.cpf || '',
            rg: funcionarioData.rg || '',
            dataNascimento: funcionarioData.dataNascimento ? funcionarioData.dataNascimento.substring(0, 10) : '',
            razaoSocial: funcionarioData.razaoSocial || '',
            nomeFantasia: funcionarioData.nomeFantasia || '',
            cnpj: funcionarioData.cnpj || '',
            inscricaoEstadual: funcionarioData.inscricaoEstadual || '',
            email: funcionarioData.email || '',
            telefone: funcionarioData.telefone || '',
            cargo: funcionarioData.cargo || '',
            dataAdmissao: funcionarioData.dataAdmissao ? funcionarioData.dataAdmissao.substring(0, 10) : '',
            salario: funcionarioData.salario ? formatarMoeda(funcionarioData.salario) : 'R$ 0,00',
            endereco: funcionarioData.endereco || '',
            numero: funcionarioData.numero || '',
            complemento: funcionarioData.complemento || '',
            bairro: funcionarioData.bairro || '',
            cep: funcionarioData.cep || '',
            cidadeId: funcionarioData.cidadeId || '',
            observacoes: funcionarioData.observacoes || '',
            ativo: funcionarioData.ativo !== false
          });
          
          if (funcionarioData.cidadeId) {
            try {
              const cidadeResponse = await axios.get(`/api/Cidade/${funcionarioData.cidadeId}`);
              const cidadeData = cidadeResponse.data;
              console.log('Cidade carregada:', cidadeData);
              setCidadeSelecionada(cidadeData);
            } catch (cidadeErr) {
              console.error('Erro ao carregar cidade do funcionário:', cidadeErr);
            }
          }
          
        } catch (err) {
          console.error('Erro ao carregar funcionário:', err);
          setError('Erro ao carregar dados do funcionário: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFuncionario();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      console.log('Enviando dados:', values);
      
      const funcionarioData = {
        ...values,
        dataNascimento: values.dataNascimento ? new Date(values.dataNascimento).toISOString() : null,
        dataAdmissao: values.dataAdmissao ? new Date(values.dataAdmissao).toISOString() : null,
        salario: values.salario ? converterMoedaParaNumero(values.salario) : 0
      };

      // Se for pessoa física, limpar campos de pessoa jurídica
      if (values.tipoPessoa === 'F') {
        funcionarioData.razaoSocial = '';
        funcionarioData.nomeFantasia = '';
        funcionarioData.cnpj = '';
        funcionarioData.inscricaoEstadual = '';
      } 
      // Se for pessoa jurídica, limpar campos de pessoa física
      else if (values.tipoPessoa === 'J') {
        funcionarioData.nome = '';
        funcionarioData.cpf = '';
        funcionarioData.rg = '';
        funcionarioData.dataNascimento = null;
      }
      
      if (id) {
        await axios.put(`/api/Funcionario/${id}`, funcionarioData);
      } else {
        await axios.post('/api/Funcionario', funcionarioData);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => navigate('/funcionarios'), 2000);
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err);
      setError('Erro ao salvar dados: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Função para tratar a entrada de valores no campo de salário
  const handleSalarioChange = (e, setFieldValue) => {
    // Pega o valor atual do campo
    let valor = e.target.value;
    
    // Se o usuário está tentando limpar o campo, definimos o valor mínimo
    if (!valor || valor === 'R$ ' || valor === 'R$') {
      setFieldValue('salario', 'R$ 0,00');
      return;
    }
    
    // Remove tudo que não é número
    const apenasDigitos = valor.replace(/\D/g, '');
    
    // Converte para número (em centavos, depois divide por 100)
    const valorNumerico = parseInt(apenasDigitos) / 100;
    
    // Formata como moeda
    const valorFormatado = formatarMoeda(valorNumerico);
    
    setFieldValue('salario', valorFormatado);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="p-0">
      <Card className="border-0 shadow-sm">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{id ? 'Editar' : 'Novo'} Funcionário</h2>
            <Button color="secondary" onClick={() => navigate('/funcionarios')}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Voltar
            </Button>
          </div>
          
          {error && <Alert color="danger">{error}</Alert>}
          {submitSuccess && <Alert color="success">Funcionário salvo com sucesso!</Alert>}
          
          <Formik
            initialValues={initialValues}
            validationSchema={createValidationSchema(tipoPessoaValue)}
            onSubmit={handleSubmit}
            enableReinitialize
            innerRef={formikRef}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
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
                            checked={values.tipoPessoa === 'F'}
                            onChange={(e) => {
                              setFieldValue('tipoPessoa', e.target.value);
                              setTipoPessoaValue(e.target.value);
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
                            }}
                          />
                          <Label check for="tipoPessoaJ">Pessoa Jurídica</Label>
                        </FormGroup>
                      </div>
                      {touched.tipoPessoa && errors.tipoPessoa && (
                        <FormFeedback style={{ display: 'block' }}>{errors.tipoPessoa}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <h4 className="mb-3">Dados {values.tipoPessoa === 'F' ? 'Pessoais' : 'da Empresa'}</h4>
                  </Col>
                </Row>
                
                {values.tipoPessoa === 'F' ? (
                  // Campos para Pessoa Física
                  <>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="nome">Nome Completo*</Label>
                          <Input
                            type="text"
                            name="nome"
                            id="nome"
                            value={values.nome}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.nome && !!errors.nome}
                          />
                          {touched.nome && errors.nome && <FormFeedback>{errors.nome}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="cpf">CPF*</Label>
                          <Input
                            type="text"
                            name="cpf"
                            id="cpf"
                            value={values.cpf}
                            onChange={(e) => {
                              const formatted = formatarCPF(e.target.value);
                              setFieldValue('cpf', formatted);
                            }}
                            onBlur={handleBlur}
                            invalid={touched.cpf && !!errors.cpf}
                          />
                          {touched.cpf && errors.cpf && <FormFeedback>{errors.cpf}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="rg">RG</Label>
                          <Input
                            type="text"
                            name="rg"
                            id="rg"
                            value={values.rg}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="dataNascimento">Data de Nascimento</Label>
                          <Input
                            type="date"
                            name="dataNascimento"
                            id="dataNascimento"
                            value={values.dataNascimento}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={4}>
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
                          {touched.email && errors.email && <FormFeedback>{errors.email}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="telefone">Telefone</Label>
                          <Input
                            type="text"
                            name="telefone"
                            id="telefone"
                            value={values.telefone}
                            onChange={(e) => {
                              const formatted = formatarTelefone(e.target.value);
                              setFieldValue('telefone', formatted);
                            }}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Campos para Pessoa Jurídica
                  <>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="razaoSocial">Razão Social*</Label>
                          <Input
                            type="text"
                            name="razaoSocial"
                            id="razaoSocial"
                            value={values.razaoSocial}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.razaoSocial && !!errors.razaoSocial}
                          />
                          {touched.razaoSocial && errors.razaoSocial && <FormFeedback>{errors.razaoSocial}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="nomeFantasia">Nome Fantasia</Label>
                          <Input
                            type="text"
                            name="nomeFantasia"
                            id="nomeFantasia"
                            value={values.nomeFantasia}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="cnpj">CNPJ*</Label>
                          <Input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={values.cnpj}
                            onChange={(e) => {
                              const formatted = formatarCNPJ(e.target.value);
                              setFieldValue('cnpj', formatted);
                            }}
                            onBlur={handleBlur}
                            invalid={touched.cnpj && !!errors.cnpj}
                          />
                          {touched.cnpj && errors.cnpj && <FormFeedback>{errors.cnpj}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="inscricaoEstadual">Inscrição Estadual</Label>
                          <Input
                            type="text"
                            name="inscricaoEstadual"
                            id="inscricaoEstadual"
                            value={values.inscricaoEstadual}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={3}>
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
                          {touched.email && errors.email && <FormFeedback>{errors.email}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label for="telefone">Telefone</Label>
                          <Input
                            type="text"
                            name="telefone"
                            id="telefone"
                            value={values.telefone}
                            onChange={(e) => {
                              const formatted = formatarTelefone(e.target.value);
                              setFieldValue('telefone', formatted);
                            }}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Dados profissionais - comum a ambos os tipos */}
                <Row className="mt-4">
                  <Col md={12}>
                    <h4 className="mb-3">Dados Profissionais</h4>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="cargo">Cargo*</Label>
                      <Input
                        type="text"
                        name="cargo"
                        id="cargo"
                        value={values.cargo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.cargo && !!errors.cargo}
                      />
                      {touched.cargo && errors.cargo && <FormFeedback>{errors.cargo}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="dataAdmissao">Data de Admissão</Label>
                      <Input
                        type="date"
                        name="dataAdmissao"
                        id="dataAdmissao"
                        value={values.dataAdmissao}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="salario">Salário</Label>
                      <Input
                        type="text"
                        name="salario"
                        id="salario"
                        value={values.salario}
                        onChange={(e) => handleSalarioChange(e, setFieldValue)}
                        onBlur={(e) => {
                          // Ao perder o foco, garantimos que o valor esteja formatado corretamente
                          handleBlur(e);
                          const valorNumerico = converterMoedaParaNumero(values.salario);
                          const valorFormatado = formatarMoeda(valorNumerico);
                          setFieldValue('salario', valorFormatado);
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={12}>
                    <h4 className="mb-3">Endereço</h4>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="endereco">Endereço*</Label>
                      <Input
                        type="text"
                        name="endereco"
                        id="endereco"
                        value={values.endereco}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.endereco && !!errors.endereco}
                      />
                      {touched.endereco && errors.endereco && <FormFeedback>{errors.endereco}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label for="numero">Número*</Label>
                      <Input
                        type="text"
                        name="numero"
                        id="numero"
                        value={values.numero}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.numero && !!errors.numero}
                      />
                      {touched.numero && errors.numero && <FormFeedback>{errors.numero}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="complemento">Complemento</Label>
                      <Input
                        type="text"
                        name="complemento"
                        id="complemento"
                        value={values.complemento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="bairro">Bairro*</Label>
                      <Input
                        type="text"
                        name="bairro"
                        id="bairro"
                        value={values.bairro}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.bairro && !!errors.bairro}
                      />
                      {touched.bairro && errors.bairro && <FormFeedback>{errors.bairro}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="cep">CEP</Label>
                      <Input
                        type="text"
                        name="cep"
                        id="cep"
                        value={values.cep}
                        onChange={(e) => {
                          const formatted = formatarCEP(e.target.value);
                          setFieldValue('cep', formatted);
                        }}
                        onBlur={handleBlur}
                        invalid={touched.cep && !!errors.cep}
                      />
                      {touched.cep && errors.cep && <FormFeedback>{errors.cep}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={5}>
                    <FormGroup>
                      <Label for="cidadeId">Cidade*</Label>
                      <div className="d-flex">
                        <Input
                          type="text"
                          name="cidadeNome"
                          id="cidadeNome"
                          value={cidadeSelecionada ? `${cidadeSelecionada.nome} - ${cidadeSelecionada.estado?.uf || ''}` : ''}
                          onChange={() => {/* Campo é somente leitura */}}
                          placeholder="Selecione uma cidade..."
                          invalid={touched.cidadeId && !!errors.cidadeId}
                          className="flex-grow-1"
                          readOnly
                        />
                        <Button
                          outline
                          color="primary" 
                          type="button"
                          className="ms-2"
                          onClick={() => setCidadeModalOpen(true)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {touched.cidadeId && errors.cidadeId && <FormFeedback style={{ display: 'block' }}>{errors.cidadeId}</FormFeedback>}
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup>
                      <Label for="observacoes">Observações</Label>
                      <Input
                        type="textarea"
                        name="observacoes"
                        id="observacoes"
                        value={values.observacoes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup check>
                      <Input
                        type="checkbox"
                        name="ativo"
                        id="ativo"
                        checked={values.ativo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <Label for="ativo" check>Funcionário ativo</Label>
                    </FormGroup>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    color="primary"
                    className="me-2"
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
      
      {/* Modal de seleção de cidade */}
      <CidadeSearchModal
        isOpen={cidadeModalOpen}
        toggle={() => setCidadeModalOpen(!cidadeModalOpen)}
        onSelect={async (cidade) => {
          try {
            // Buscar a cidade completa com informações detalhadas
            if (cidade && cidade.id) {
              // Importar e usar o serviço CidadeService
              const cidadeService = await import('../../../api/services/cidadeService');
              const cidadeCompleta = await cidadeService.default.getById(cidade.id);
              console.log("Cidade completa recebida:", cidadeCompleta);
              setCidadeSelecionada(cidadeCompleta);
            } else {
              setCidadeSelecionada(cidade);
            }
            setCidadeModalOpen(false);
            // O useEffect cuidará de atualizar o formik
          } catch (error) {
            console.error("Erro ao buscar detalhes da cidade:", error);
            setCidadeSelecionada(cidade);
            setCidadeModalOpen(false);
          }
        }}
        renderButton={false} /* Desabilitar botão flutuante */
      />

      {/* Modal de seleção de estado */}
      <EstadoSearchModal
        isOpen={estadoModalOpen}
        toggle={() => setEstadoModalOpen(!estadoModalOpen)}
        onSelect={(estado) => {
          setEstadoSelecionado(estado);
          setEstadoModalOpen(false);
        }}
        renderButton={false}
      />

      {/* Modal de seleção de país */}
      <PaisSearchModal
        isOpen={paisModalOpen}
        toggle={() => setPaisModalOpen(!paisModalOpen)}
        onSelect={(pais) => {
          setPaisSelecionado(pais);
          setPaisModalOpen(false);
        }}
        renderButton={false}
      />
    </Container>
  );
};

export default FuncionarioForm;
