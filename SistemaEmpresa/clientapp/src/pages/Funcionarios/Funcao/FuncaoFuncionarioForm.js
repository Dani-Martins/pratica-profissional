import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardBody, Button, FormGroup, Label, Input,
  Alert, Row, Col, Spinner, FormFeedback, Container
} from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useDataContext } from '../../../contexts/DataContext';
import { transformToUpperCase, handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

// Schema de validação
const validationSchema = Yup.object().shape({
  descricao: Yup.string()
    .required('Descrição é obrigatória')
    .min(2, 'Descrição deve ter pelo menos 2 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  funcaofuncionario: Yup.string()
    .required('Função do Funcionário é obrigatória')
    .min(2, 'Função do Funcionário deve ter pelo menos 2 caracteres')
    .max(100, 'Função do Funcionário deve ter no máximo 100 caracteres'),
  cargahoraria: Yup.number()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' || originalValue === null || originalValue === undefined ? null : value)
    .typeError('Carga horária deve ser um número')
    .min(0, 'Carga horária não pode ser negativa'),
  requercnh: Yup.boolean(),
  tipoCNHRequerido: Yup.string().when('requercnh', {
    is: true,
    then: () => Yup.string().required('Tipo de CNH requerido é obrigatório quando "Requer CNH" está marcado'),
    otherwise: () => Yup.string().nullable()
  }),
  ativo: Yup.boolean()
});

const FuncaoFuncionarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  
  const [initialValues, setInitialValues] = useState({
    descricao: '',
    funcaofuncionario: '',
    cargahoraria: '',
    requercnh: false,
    tipoCNHRequerido: '',
    ativo: true,
    observacao: ''
  });

  useEffect(() => {
    if (id) {
      carregarFuncao(id);
    }
  }, [id]);  const carregarFuncao = async (funcaoId) => {
    setInitialLoading(true);
    try {
      const response = await apiClient.get(`/FuncaoFuncionario/${funcaoId}`);
      
      if (response.data) {
        // Logar a estrutura completa para debug
        console.log("Dados da função carregados:", JSON.stringify(response.data, null, 2));
        
        // Verificar quais campos existem e seus valores
        const data = response.data;
        
        // Mapear os nomes dos campos (o backend usa camelCase com primeira letra maiúscula)
        console.log("funcaoFuncionarioNome:", data.funcaoFuncionarioNome);
        console.log("cargaHoraria:", data.cargaHoraria, "tipo:", typeof data.cargaHoraria);
        console.log("requerCNH:", data.requerCNH, "tipo:", typeof data.requerCNH);
        console.log("tipoCNHRequerido:", data.tipoCNHRequerido);
        console.log("ativo:", data.ativo, "tipo:", typeof data.ativo);
        
        // Garantir que os valores sejam do tipo correto e mapeados corretamente
        setInitialValues({
          descricao: data.descricao || '',
          funcaofuncionario: data.funcaoFuncionarioNome || data.descricao || '',
          cargahoraria: data.cargaHoraria !== null && data.cargaHoraria !== undefined ? 
                      data.cargaHoraria : '',
          requercnh: Boolean(data.requerCNH),
          tipoCNHRequerido: data.tipoCNHRequerido || '',
          ativo: data.ativo !== false,  // Se undefined ou null, será true
          observacao: data.observacao || ''
        });
        
        // Logar os valores inicializados
        console.log("Valores inicializados:", {
          descricao: data.descricao || '',
          funcaofuncionario: data.funcaoFuncionarioNome || data.descricao || '',
          cargahoraria: data.cargaHoraria !== null && data.cargaHoraria !== undefined ? data.cargaHoraria : '',
          requercnh: Boolean(data.requerCNH),
          ativo: data.ativo !== false,
          observacao: data.observacao || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar função:', err);
      setSubmitError(`Erro ao carregar dados da função: ${err.message}`);
    } finally {
      setInitialLoading(false);
    }
  };
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      let response;
        // Garantir que todos os valores estejam no formato correto para a API
      // e que os nomes dos campos estejam corretos conforme o backend espera
      const payload = {
        id: id ? parseInt(id) : 0,
        descricao: values.descricao ? values.descricao.toUpperCase() : '',
        funcaoFuncionarioNome: values.funcaofuncionario ? values.funcaofuncionario.toUpperCase() : '',
        cargaHoraria: values.cargahoraria !== null && values.cargahoraria !== '' ? 
                     parseFloat(values.cargahoraria) : null,
        requerCNH: Boolean(values.requercnh),
        // Garantir que tipoCNHRequerido seja enviado apenas quando requerCNH for true,
        // e que seja sempre em maiúsculo
        tipoCNHRequerido: values.requercnh 
          ? (values.tipoCNHRequerido ? values.tipoCNHRequerido.toUpperCase() : null) 
          : null,
        ativo: Boolean(values.ativo),
        observacao: values.observacao ? values.observacao.toUpperCase() : '',
        situacao: values.ativo ? 'A' : 'I'
      };
      
      // Log detalhado para depuração
      console.log('Payload completo enviado para API:', JSON.stringify(payload, null, 2));
      
      if (id) {
        // Atualizar função existente
        response = await apiClient.put(`/FuncaoFuncionario/${id}`, payload);
        console.log('Função atualizada:', response.data);
        
        // Exibir mensagem na página atual por alguns segundos
        setSubmitError(null);
        setSubmitSuccess(true);
        
        // Aguardar alguns segundos antes de redirecionar
        setTimeout(() => {
          navigate('/funcionarios/funcoes');
        }, 1500);
      } else {
        // Criar nova função
        response = await apiClient.post('/FuncaoFuncionario', payload);
        console.log('Função criada:', response.data);
        
        // Exibir mensagem na página atual por alguns segundos
        setSubmitError(null);
        setSubmitSuccess(true);
        
        // Aguardar alguns segundos antes de redirecionar
        setTimeout(() => {
          navigate('/funcionarios/funcoes');
        }, 1500);
      }    } catch (err) {
      console.error('Erro ao salvar função:', err);
      console.error('Detalhes do erro:', err.response?.data);
      
      let mensagemErro = 'Ocorreu um erro ao salvar a função. Por favor, tente novamente.';
      
      if (err.response && err.response.data) {
        // Mostrar detalhes específicos do erro para facilitar a depuração
        if (typeof err.response.data === 'string') {
          mensagemErro = err.response.data;
        } else if (err.response.data.message) {
          mensagemErro = err.response.data.message;
        } else if (err.response.data.title) {
          mensagemErro = err.response.data.title;
        } else if (err.response.data.errors) {
          // Tratamento específico para ValidationProblemDetails
          const erros = Object.entries(err.response.data.errors)
            .map(([campo, mensagens]) => `${campo}: ${mensagens.join(', ')}`)
            .join('; ');
          mensagemErro = `Erros de validação: ${erros}`;
        }
      }
      
      setSubmitError(mensagemErro);
      setSubmitSuccess(false);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados da função...</p>
      </div>
    );
  }

  return (
    <Container>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">{id ? 'Editar Função de Funcionário' : 'Nova Função de Funcionário'}</h4>
          </div>

          {submitError && (
            <Alert color="danger" className="mb-4">
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              {submitError}
            </Alert>
          )}

          {submitSuccess && (
            <Alert color="success" className="mb-4">
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Função de Funcionário salva com sucesso!
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
              <Form>                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="funcaofuncionario">Função do Funcionário *</Label>
                      <Field
                        as={Input}
                        type="text"
                        name="funcaofuncionario"
                        id="funcaofuncionario"
                        value={values.funcaofuncionario}
                        onChange={(e) => handleUpperCaseChange(e, setFieldValue)}
                        onBlur={handleBlur}
                        invalid={touched.funcaofuncionario && errors.funcaofuncionario ? true : false}
                      />
                      {touched.funcaofuncionario && errors.funcaofuncionario && (
                        <FormFeedback>{errors.funcaofuncionario}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  
                  <Col md={6}>
                    <FormGroup>
                      <Label for="descricao">Descrição *</Label>
                      <Field
                        as={Input}
                        type="text"
                        name="descricao"
                        id="descricao"
                        value={values.descricao}
                        onChange={(e) => handleUpperCaseChange(e, setFieldValue)}
                        onBlur={handleBlur}
                        invalid={touched.descricao && errors.descricao ? true : false}
                      />
                      {touched.descricao && errors.descricao && (
                        <FormFeedback>{errors.descricao}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>                  <Col md={6}>
                    <FormGroup>
                      <Label for="cargahoraria">Carga Horária (horas)</Label>
                      <Input
                        type="number"
                        name="cargahoraria"
                        id="cargahoraria"
                        value={values.cargahoraria}
                        onChange={(e) => {
                          const valor = e.target.value;
                          // Tratar o valor para que seja um número ou string vazia
                          setFieldValue('cargahoraria', valor === '' ? '' : parseFloat(valor));
                        }}
                        onBlur={handleBlur}
                        invalid={touched.cargahoraria && errors.cargahoraria ? true : false}
                      />
                      {touched.cargahoraria && errors.cargahoraria && (
                        <FormFeedback>{errors.cargahoraria}</FormFeedback>
                      )}
                      <small className="text-muted">
                        Deixe em branco se não houver carga horária definida
                      </small>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup className="mt-4">
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          id="requercnh"
                          name="requercnh"
                          checked={values.requercnh}
                          onChange={() => {
                            setFieldValue('requercnh', !values.requercnh);
                            if (!values.requercnh) {
                              // Se estiver marcando a opção, deixa o campo de tipo CNH vazio
                              setFieldValue('tipoCNHRequerido', '');
                            } else {
                              // Se estiver desmarcando, limpa o campo de tipo CNH
                              setFieldValue('tipoCNHRequerido', '');
                            }
                          }}
                          className="form-check-input"
                        />
                        <Label for="requercnh" className="form-check-label">
                          Requer CNH
                        </Label>
                      </div>
                    </FormGroup>
                    
                    {values.requercnh && (
                      <FormGroup className="mt-2">
                        <Label for="tipoCNHRequerido">Categoria de CNH Requerida</Label>
                        <Input
                          type="select"
                          id="tipoCNHRequerido"
                          name="tipoCNHRequerido"
                          value={values.tipoCNHRequerido}
                          onChange={(e) => {
                            // Converter para maiúsculas antes de definir o valor
                            setFieldValue('tipoCNHRequerido', e.target.value.toUpperCase());
                          }}
                          onBlur={handleBlur}
                          invalid={touched.tipoCNHRequerido && errors.tipoCNHRequerido}
                        >
                          <option value="">Selecione a categoria...</option>
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
                        {touched.tipoCNHRequerido && errors.tipoCNHRequerido && (
                          <FormFeedback>{errors.tipoCNHRequerido}</FormFeedback>
                        )}
                      </FormGroup>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="observacao">Observações</Label>
                      <Input
                        type="textarea"
                        name="observacao"
                        id="observacao"
                        rows="4"
                        value={values.observacao || ''}
                        onChange={(e) => handleUpperCaseChange(e, setFieldValue)}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>
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
                  </Col>
                </Row>                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button 
                    type="submit" 
                    color="primary" 
                    disabled={isSubmitting || loading}
                    className="me-2"
                  >
                    {(isSubmitting || loading) && <Spinner size="sm" className="me-2" />}
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Salvar
                  </Button>
                  
                  <Button 
                    type="button" 
                    color="secondary" 
                    onClick={() => navigate('/funcionarios/funcoes')}
                    disabled={isSubmitting || loading}
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
    </Container>
  );
};

export default FuncaoFuncionarioForm;
