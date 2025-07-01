import React, { useState } from 'react';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Container
} from 'reactstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../api/services/authService';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  senha: Yup.string()
    .required('Senha é obrigatória')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  
  // Removi o bypass automático de login
  
  // Obter a origem do redirecionamento (se houver)
  const from = location.state?.from?.pathname || '/';
  
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Chama a API real de login
      await AuthService.login({
        email: values.email,
        senha: values.senha
      });
      
      // Redirecionar para a página original ou para home
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <h1 className="text-center mb-4">Sistema Empresa</h1>
        <p className="text-center text-muted mb-4">Faça login para acessar o sistema</p>
        
        <Card>
          <CardBody>
            {error && (
              <Alert color="danger">
                {error}
              </Alert>
            )}
            
            <Formik
              initialValues={{ email: '', senha: '' }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="email">Email</Label>
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
                  
                  <FormGroup>
                    <Label for="senha">Senha</Label>
                    <Input
                      type="password"
                      name="senha"
                      id="senha"
                      value={values.senha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.senha && !!errors.senha}
                    />
                    {touched.senha && errors.senha && (
                      <div className="text-danger">{errors.senha}</div>
                    )}
                  </FormGroup>
                  
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    block
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;