import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col, Badge 
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Schema de validação
const StatusNFESchema = Yup.object().shape({
  codigo: Yup.string()
    .required('Código é obrigatório')
    .matches(/^\d{3}$/, 'Código deve conter 3 dígitos'),
  descricao: Yup.string()
    .required('Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  cor: Yup.string()
    .required('Cor é obrigatória'),
  observacoes: Yup.string()
    .max(255, 'Observações devem ter no máximo 255 caracteres')
});

const StatusNFEForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    codigo: '',
    descricao: '',
    cor: 'primary',
    observacoes: '',
    ativo: true
  });
  const [error, setError] = useState(null);
  
  // Opções de cores
  const cores = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'dark'
  ];
  
  useEffect(() => {
    // Carregar dados do status para edição
    const fetchStatusNFE = async () => {
      if (id) {
        try {
          setLoading(true);
          
          // Simular status para desenvolvimento
          setTimeout(() => {
            setInitialValues({
              codigo: '100',
              descricao: 'Autorizado o uso da NF-e',
              cor: 'success',
              observacoes: 'NF-e autorizada com sucesso',
              ativo: true
            });
            setLoading(false);
          }, 1000);
        } catch (err) {
          setError('Erro ao carregar status NFE: ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchStatusNFE();
  }, [id]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      if (id) {
        // await StatusNFEService.update(id, values);
        console.log('Atualizando status NFE:', values);
      } else {
        // await StatusNFEService.create(values);
        console.log('Criando status NFE:', values);
      }
      
      navigate('/status-nfe');
    } catch (err) {
      setError('Erro ao salvar status NFE: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do status...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          {id ? 'Editar Status NFE' : 'Novo Status NFE'}
        </h2>
        <Button 
          color="secondary" 
          onClick={() => navigate('/status-nfe')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar
        </Button>
      </div>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={StatusNFESchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={2}>
                    <FormGroup>
                      <Label for="codigo">Código*</Label>
                      <Input
                        type="text"
                        name="codigo"
                        id="codigo"
                        maxLength={3}
                        value={values.codigo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.codigo && !!errors.codigo}
                      />
                      {touched.codigo && errors.codigo && (
                        <div className="text-danger">{errors.codigo}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={7}>
                    <FormGroup>
                      <Label for="descricao">Descrição*</Label>
                      <Input
                        type="text"
                        name="descricao"
                        id="descricao"
                        maxLength={100}
                        value={values.descricao}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.descricao && !!errors.descricao}
                      />
                      {touched.descricao && errors.descricao && (
                        <div className="text-danger">{errors.descricao}</div>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
                    <FormGroup>
                      <Label for="cor">Cor*</Label>
                      <Input
                        type="select"
                        name="cor"
                        id="cor"
                        value={values.cor}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.cor && !!errors.cor}
                      >
                        {cores.map(cor => (
                          <option key={cor} value={cor}>
                            {cor}
                          </option>
                        ))}
                      </Input>
                      {touched.cor && errors.cor && (
                        <div className="text-danger">{errors.cor}</div>
                      )}
                      <div className="mt-2">
                        <Badge color={values.cor} className="p-2">
                          Visualização da cor
                        </Badge>
                      </div>
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
                    invalid={touched.observacoes && !!errors.observacoes}
                  />
                  {touched.observacoes && errors.observacoes && (
                    <div className="text-danger">{errors.observacoes}</div>
                  )}
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
                      Status ativo
                    </Label>
                  </FormGroup>
                )}
                
                <div className="d-flex gap-2 mt-4">
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
                    onClick={() => navigate('/status-nfe')}
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

export default StatusNFEForm;