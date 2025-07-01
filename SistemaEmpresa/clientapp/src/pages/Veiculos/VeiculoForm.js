import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col 
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTimes, faCar } from '@fortawesome/free-solid-svg-icons';
import SearchButton from '../../components/buttons/SearchButton';

// Schema de validação
const VeiculoSchema = Yup.object().shape({
  placa: Yup.string()
    .required('Placa é obrigatória')
    .matches(/^[A-Z]{3}\-\d{4}$/, 'Formato de placa inválido (AAA-1234)'),
  marca: Yup.string()
    .required('Marca é obrigatória')
    .max(50, 'Marca deve ter no máximo 50 caracteres'),
  modelo: Yup.string()
    .required('Modelo é obrigatório')
    .max(50, 'Modelo deve ter no máximo 50 caracteres'),
  ano: Yup.number()
    .required('Ano é obrigatório')
    .integer('Ano deve ser um número inteiro')
    .min(1980, 'Ano mínimo: 1980')
    .max(new Date().getFullYear() + 1, `Ano máximo: ${new Date().getFullYear() + 1}`),
  transportadoraId: Yup.number()
    .required('Transportadora é obrigatória'),
  tipo: Yup.string()
    .required('Tipo é obrigatório'),
  capacidade: Yup.number()
    .required('Capacidade é obrigatória')
    .positive('Capacidade deve ser um valor positivo')
});

const VeiculoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transportadoras, setTransportadoras] = useState([]);
  const [initialValues, setInitialValues] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    transportadoraId: '',
    tipo: '',
    capacidade: '',
    renavam: '',
    chassi: '',
    cor: '',
    observacoes: '',
    ativo: true
  });
  const [error, setError] = useState(null);
  const [transportadoraModalOpen, setTransportadoraModalOpen] = useState(false);
  
  // Tipos de veículos
  const tiposVeiculo = [
    'Caminhão Baú',
    'Caminhão Carroceria',
    'Caminhão Frigorífico',
    'Caminhão Tanque',
    'Carreta',
    'Furgão',
    'Motocicleta',
    'Utilitário',
    'Van',
    'Outro'
  ];
  
  // Marcas de veículos populares
  const marcasPopulares = [
    'Ford',
    'Volkswagen',
    'Mercedes-Benz',
    'Volvo',
    'Scania',
    'Iveco',
    'DAF',
    'MAN',
    'Fiat',
    'Renault',
    'Chevrolet',
    'Toyota',
    'Honda',
    'Hyundai',
    'Outro'
  ];
  
  useEffect(() => {
    // Carregar lista de transportadoras
    const fetchTransportadoras = async () => {
      try {
        // Simulação de dados
        setTransportadoras([
          { id: 1, nome: 'Transportadora A' },
          { id: 2, nome: 'Transportadora B' },
          { id: 3, nome: 'Transportadora C' },
          { id: 4, nome: 'Transportadora D' },
          { id: 5, nome: 'Transportadora E' }
        ]);
      } catch (err) {
        setError('Erro ao carregar transportadoras: ' + err.message);
      }
    };
    
    fetchTransportadoras();
    
    // Carregar dados do veículo para edição
    const fetchVeiculo = async () => {
      if (id) {
        try {
          setLoading(true);
          
          // Simular veículo para desenvolvimento
          setTimeout(() => {
            setInitialValues({
              placa: 'ABC-1234',
              marca: 'Volvo',
              modelo: 'FH 460',
              ano: 2020,
              transportadoraId: 2,
              tipo: 'Caminhão Baú',
              capacidade: 28000,
              renavam: '12345678901',
              chassi: '9BWHE21JX24060960',
              cor: 'Branco',
              observacoes: 'Caminhão para entregas longas distâncias',
              ativo: true
            });
            setLoading(false);
          }, 1000);
        } catch (err) {
          setError('Erro ao carregar veículo: ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchVeiculo();
  }, [id]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      if (id) {
        // await VeiculoService.update(id, values);
        console.log('Atualizando veículo:', values);
      } else {
        // await VeiculoService.create(values);
        console.log('Criando veículo:', values);
      }
      
      navigate('/veiculos');
    } catch (err) {
      setError('Erro ao salvar veículo: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePlacaChange = (e, setFieldValue) => {
    // Formatando a placa para padrão AAA-1234
    let value = e.target.value.toUpperCase();
    
    // Remove caracteres não alfanuméricos
    value = value.replace(/[^A-Z0-9]/g, '');
    
    // Adiciona o hífen após as 3 primeiras letras
    if (value.length > 3) {
      value = `${value.substring(0, 3)}-${value.substring(3, 7)}`;
    }
    
    setFieldValue('placa', value);
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do veículo...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faCar} className="me-2" />
          {id ? 'Editar Veículo' : 'Novo Veículo'}
        </h2>
      </div>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={VeiculoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="placa">Placa*</Label>
                      <Input
                        type="text"
                        name="placa"
                        id="placa"
                        maxLength={8}
                        value={values.placa}
                        onChange={(e) => handlePlacaChange(e, setFieldValue)}
                        onBlur={handleBlur}
                        invalid={touched.placa && !!errors.placa}
                      />
                      {touched.placa && errors.placa && (
                        <div className="text-danger">{errors.placa}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="marca">Marca*</Label>
                      <Input
                        type="select"
                        name="marca"
                        id="marca"
                        value={values.marca}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.marca && !!errors.marca}
                      >
                        <option value="">Selecione...</option>
                        {marcasPopulares.map((marca, index) => (
                          <option key={index} value={marca}>
                            {marca}
                          </option>
                        ))}
                      </Input>
                      {touched.marca && errors.marca && (
                        <div className="text-danger">{errors.marca}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="modelo">Modelo*</Label>
                      <Input
                        type="text"
                        name="modelo"
                        id="modelo"
                        maxLength={50}
                        value={values.modelo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.modelo && !!errors.modelo}
                      />
                      {touched.modelo && errors.modelo && (
                        <div className="text-danger">{errors.modelo}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="ano">Ano*</Label>
                      <Input
                        type="number"
                        name="ano"
                        id="ano"
                        min={1980}
                        max={new Date().getFullYear() + 1}
                        value={values.ano}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.ano && !!errors.ano}
                      />
                      {touched.ano && errors.ano && (
                        <div className="text-danger">{errors.ano}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="transportadoraId">Transportadora*{' '}
                        <SearchButton
                          onClick={() => setTransportadoraModalOpen(true)}
                          title="Buscar transportadora"
                        />
                      </Label>
                      <Input
                        type="select"
                        name="transportadoraId"
                        id="transportadoraId"
                        value={values.transportadoraId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.transportadoraId && !!errors.transportadoraId}
                      >
                        <option value="">Selecione...</option>
                        {transportadoras.map((t) => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </Input>
                      {touched.transportadoraId && errors.transportadoraId && (
                        <div className="text-danger">{errors.transportadoraId}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="tipo">Tipo*</Label>
                      <Input
                        type="select"
                        name="tipo"
                        id="tipo"
                        value={values.tipo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.tipo && !!errors.tipo}
                      >
                        <option value="">Selecione...</option>
                        {tiposVeiculo.map((tipo, index) => (
                          <option key={index} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </Input>
                      {touched.tipo && errors.tipo && (
                        <div className="text-danger">{errors.tipo}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="capacidade">Capacidade (kg)*</Label>
                      <Input
                        type="number"
                        name="capacidade"
                        id="capacidade"
                        min="1"
                        step="1"
                        value={values.capacidade}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.capacidade && !!errors.capacidade}
                      />
                      {touched.capacidade && errors.capacidade && (
                        <div className="text-danger">{errors.capacidade}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="renavam">RENAVAM</Label>
                      <Input
                        type="text"
                        name="renavam"
                        id="renavam"
                        maxLength={11}
                        value={values.renavam}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md={5}>
                    <FormGroup>
                      <Label for="chassi">Chassi</Label>
                      <Input
                        type="text"
                        name="chassi"
                        id="chassi"
                        maxLength={17}
                        value={values.chassi}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setFieldValue('chassi', upperValue);
                        }}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="cor">Cor</Label>
                      <Input
                        type="text"
                        name="cor"
                        id="cor"
                        maxLength={20}
                        value={values.cor}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
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
                  <FormGroup check className="mb-3">
                    <Label check>
                      <Input
                        type="checkbox"
                        name="ativo"
                        checked={values.ativo}
                        onChange={handleChange}
                      />{' '}
                      Veículo ativo
                    </Label>
                  </FormGroup>
                )}
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button 
                    type="submit" 
                    color="primary" 
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
                    onClick={() => navigate('/veiculos')}
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
    </div>
  );
};

export default VeiculoForm;