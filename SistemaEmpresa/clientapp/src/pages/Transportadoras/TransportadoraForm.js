import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faArrowLeft, faTimes, faTruck, faSearch
} from '@fortawesome/free-solid-svg-icons';
import TransportadoraService from '../../api/services/transportadoraService';
import CidadeSearchModal from '../Localizacao/Cidade/CidadeSearchModal';

// Schema de validação
const TransportadoraSchema = Yup.object().shape({
  razaoSocial: Yup.string()
    .required('Razão Social é obrigatória')
    .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
    .max(150, 'Razão Social deve ter no máximo 150 caracteres'),
  nomeFantasia: Yup.string()
    .min(2, 'Nome Fantasia deve ter pelo menos 2 caracteres')
    .max(100, 'Nome Fantasia deve ter no máximo 100 caracteres')
    .nullable(),
  cnpj: Yup.string()
    .required('CNPJ é obrigatório')
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'CNPJ inválido'),
  email: Yup.string()
    .email('Email inválido')
    .nullable(),
  telefone: Yup.string()
    .nullable(),  endereco: Yup.object().shape({
    logradouro: Yup.string().required('Endereço é obrigatório')
  }),
  cidadeId: Yup.number().nullable().required('Selecione uma cidade')
});

const TransportadoraForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const formikRef = useRef(null);
  
  const [initialValues, setInitialValues] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    observacoes: '',
    endereco: {
      logradouro: '',
      cidade: ''
    },
    cidadeId: null,
    ativo: true
  });
  const [error, setError] = useState(null);
  // Atualiza o cidadeId no formulário quando a cidade selecionada muda
  useEffect(() => {
    if (cidadeSelecionada && formikRef.current && formikRef.current.setFieldValue) {
      console.log("Cidade selecionada:", cidadeSelecionada);
      formikRef.current.setFieldValue('cidadeId', cidadeSelecionada.id);
    }
  }, [cidadeSelecionada]);

  useEffect(() => {
    // Carregar dados da transportadora para edição
    const fetchTransportadora = async () => {
      if (id) {
        try {
          setLoading(true);
          const transportadoraData = await TransportadoraService.getById(id);
          
          // Mapear os dados da API para o formato do formulário
          setInitialValues({
            razaoSocial: transportadoraData.razaoSocial || '',
            nomeFantasia: transportadoraData.nomeFantasia || '',
            cnpj: transportadoraData.cnpj || '',
            email: transportadoraData.email || '',
            telefone: transportadoraData.telefone || '',
            observacoes: transportadoraData.observacoes || '',
            endereco: {
              logradouro: transportadoraData.endereco || '',
              cidade: transportadoraData.cidade?.nome || '',
              numero: transportadoraData.numero || '',
              complemento: transportadoraData.complemento || '',
              bairro: transportadoraData.bairro || '',
              cep: transportadoraData.cep || ''
            },
            cidadeId: transportadoraData.cidadeId || null,
            ativo: transportadoraData.ativo
          });
            if (transportadoraData.cidade) {
            // Garantir que o objeto cidade tenha as propriedades esperadas pelo componente
            const cidadeFormatada = {
              ...transportadoraData.cidade,
              estadoNome: transportadoraData.cidade.estado?.nome,
              estadoUf: transportadoraData.cidade.estado?.uf,
              paisNome: transportadoraData.cidade.estado?.pais?.nome
            };
            setCidadeSelecionada(cidadeFormatada);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Erro ao carregar transportadora:', err);
          setError('Erro ao carregar transportadora: ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchTransportadora();
  }, [id]);  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      if (!values.cidadeId) {
        setError('Por favor, selecione uma cidade.');
        setSubmitting(false);
        return;
      }
      
      // Preparar o objeto transportadora para envio à API no formato esperado pelo backend
      const transportadoraData = {
        razaoSocial: values.razaoSocial,
        nomeFantasia: values.nomeFantasia,
        cnpj: values.cnpj,
        email: values.email,
        telefone: values.telefone,
        endereco: values.endereco.logradouro,
        cidadeId: values.cidadeId,
        ativo: values.ativo,
        numero: values.endereco.numero || "",
        complemento: values.endereco.complemento || "",
        bairro: values.endereco.bairro || "",
        cep: values.endereco.cep || ""
      };
      
      console.log('Enviando dados para a API:', transportadoraData);
      
      if (id) {
        await TransportadoraService.update(id, transportadoraData);
        console.log('Transportadora atualizada com sucesso!');
      } else {
        const result = await TransportadoraService.create(transportadoraData);
        console.log('Transportadora criada com sucesso:', result);
      }
      
      // Após salvar com sucesso, redireciona para a lista
      navigate('/transportadoras');
    } catch (err) {
      console.error('Erro ao salvar transportadora:', err);
      setError('Erro ao salvar transportadora: ' + (err.response?.data?.mensagem || err.message));
    } finally {
      setSubmitting(false);
    }
  };
    if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados da transportadora...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>{id ? 'Editar Transportadora' : 'Nova Transportadora'}</h2>
      </div>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik            initialValues={initialValues}
            validationSchema={TransportadoraSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            innerRef={formikRef}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <h5 className="mb-4">
                  <FontAwesomeIcon icon={faTruck} className="me-2" />
                  Informações da Transportadora
                </h5>
                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
                    <FormGroup>
                      <Label for="nomeFantasia">Nome Fantasia*</Label>
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
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="veiculo">Veículo</Label>
                      <div className="d-flex align-items-center">
                        <Input
                          type="text"
                          id="veiculo"
                          name="veiculo"
                          placeholder="Buscar veículo"
                          disabled
                        />
                        <Button color="light" className="ms-2" style={{ border: '1px solid #ced4da', height: '38px', width: '38px', padding: 0 }}>
                          <FontAwesomeIcon icon={faSearch} style={{ color: '#0d6efd' }} />
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="condicaoPagamento">Condição de Pagamento</Label>
                      <div className="d-flex align-items-center">
                        <Input
                          type="text"
                          id="condicaoPagamento"
                          name="condicaoPagamento"
                          placeholder="Buscar condição de pagamento"
                          disabled
                        />
                        <Button color="light" className="ms-2" style={{ border: '1px solid #ced4da', height: '38px', width: '38px', padding: 0 }}>
                          <FontAwesomeIcon icon={faSearch} style={{ color: '#0d6efd' }} />
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="cnpj">CNPJ*</Label>
                      <Input
                        type="text"
                        name="cnpj"
                        id="cnpj"
                        maxLength={18}
                        value={values.cnpj}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.cnpj && !!errors.cnpj}
                      />
                      {touched.cnpj && errors.cnpj && (
                        <div className="text-danger">{errors.cnpj}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                  <Row>
                  <Col md={4}>
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
                  
                  <Col md={8}>
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
                
                <h5 className="mt-4 mb-3">Endereço</h5>
                  <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="endereco.logradouro">Endereço*</Label>
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
                </Row>
                  <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="cidade">Cidade*</Label>
                      <div className="d-flex">
                        <Input
                          type="text"
                          readOnly                          value={
                            cidadeSelecionada 
                              ? `${cidadeSelecionada.nome} - ${cidadeSelecionada.estadoNome || cidadeSelecionada.estado?.nome || ''} ${
                                  cidadeSelecionada.estadoUf || cidadeSelecionada.estado?.uf ? `(${cidadeSelecionada.estadoUf || cidadeSelecionada.estado?.uf})` : ''
                                }` 
                              : ''
                          }
                          placeholder="Selecione uma cidade"
                          invalid={!values.cidadeId && touched.cidadeId}
                        />
                        <Button
                          type="button"
                          color="primary"
                          className="ms-2"
                          onClick={() => setCidadeModalOpen(true)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {!values.cidadeId && touched.cidadeId && (
                        <div className="text-danger">
                          Por favor, selecione uma cidade
                        </div>
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
                
                {id && (
                  <FormGroup check className="mb-4">
                    <Label check>
                      <Input
                        type="checkbox"
                        name="ativo"
                        checked={values.ativo}
                        onChange={handleChange}
                      />{' '}
                      Transportadora ativa
                    </Label>
                  </FormGroup>
                )}                <div className="d-flex justify-content-end mt-5">
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
                    onClick={() => navigate('/transportadoras')}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancelar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>        </CardBody>
      </Card>
        {/* Modal de seleção de cidade */}      <CidadeSearchModal
        isOpen={cidadeModalOpen}
        toggle={() => setCidadeModalOpen(!cidadeModalOpen)}
        onSelect={async (cidade) => {
          try {
            // Buscar a cidade completa com informações detalhadas
            if (cidade && cidade.id) {
              // Se necessário, podemos buscar mais detalhes da cidade
              setCidadeSelecionada(cidade);
              if (formikRef.current) {
                formikRef.current.setFieldValue('cidadeId', cidade.id);
              }
            }
            setCidadeModalOpen(false);
          } catch (error) {
            console.error("Erro ao processar a cidade selecionada:", error);
            setCidadeSelecionada(cidade);
            if (cidade && cidade.id && formikRef.current) {
              formikRef.current.setFieldValue('cidadeId', cidade.id);
            }
            setCidadeModalOpen(false);
          }
        }}
        renderButton={false}
      />
    </div>
  );
};

export default TransportadoraForm;