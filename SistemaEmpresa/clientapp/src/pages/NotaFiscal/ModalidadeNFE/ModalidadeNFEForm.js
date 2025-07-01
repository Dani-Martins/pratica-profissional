import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col 
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTimes, faFileInvoice } from '@fortawesome/free-solid-svg-icons';

// Schema de validação
const ModalidadeNFESchema = Yup.object().shape({
  codigo: Yup.string()
    .required('Código é obrigatório')
    .matches(/^\d{2}$/, 'Código deve conter 2 dígitos'),
  descricao: Yup.string()
    .required('Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  observacoes: Yup.string()
    .max(255, 'Observações devem ter no máximo 255 caracteres')
});

const ModalidadeNFEForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    codigo: '',
    descricao: '',
    observacoes: '',
    ativo: true
  });
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Carregar dados da modalidade para edição
    const fetchModalidadeNFE = async () => {
      if (id) {
        try {
          setLoading(true);
          
          // Simular modalidade para desenvolvimento
          setTimeout(() => {
            setInitialValues({
              codigo: '01',
              descricao: 'Venda',
              observacoes: 'Operação de venda padrão',
              ativo: true
            });
            setLoading(false);
          }, 1000);
        } catch (err) {
          setError('Erro ao carregar modalidade NFE: ' + err.message);
          setLoading(false);
        }
      }
    };
    
    fetchModalidadeNFE();
  }, [id]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      if (id) {
        // await ModalidadeNFEService.update(id, values);
        console.log('Atualizando modalidade NFE:', values);
      } else {
        // await ModalidadeNFEService.create(values);
        console.log('Criando modalidade NFE:', values);
      }
      
      navigate('/modalidades-nfe');
    } catch (err) {
      setError('Erro ao salvar modalidade NFE: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados da modalidade...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
          {id ? 'Editar Modalidade NFE' : 'Nova Modalidade NFE'}
        </h2>
        <Button 
          color="secondary" 
          onClick={() => navigate('/modalidades-nfe')}
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
            validationSchema={ModalidadeNFESchema}
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
                        maxLength={2}
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
                  
                  <Col md={10}>
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
                      Modalidade ativa
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
                    onClick={() => navigate('/modalidades-nfe')}
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

export default ModalidadeNFEForm;