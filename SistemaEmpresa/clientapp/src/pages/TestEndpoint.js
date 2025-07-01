import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Alert, Spinner, Row, Col } from 'reactstrap';
import axios from 'axios';

const TestEndpoint = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [corsStatus, setCorsStatus] = useState('Não testado');
  
  useEffect(() => {
    // Testar CORS automaticamente quando a página carrega
    testCors();
  }, []);
  
  const testCors = async () => {
    setCorsStatus('Testando...');
    try {
      const response = await axios.get('https://localhost:7234/api/Test', { 
        withCredentials: true 
      });
      console.log("Resposta do teste CORS:", response);
      setCorsStatus('CORS funcionando corretamente! ✅');
    } catch (err) {
      console.error("Erro no teste CORS:", err);
      setCorsStatus(`Erro de CORS: ${err.message} ❌`);
    }
  };
  
  const testClientes = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log("Testando endpoint /api/Cliente...");
      const response = await axios.get('https://localhost:7234/api/Cliente', {
        withCredentials: true
      });
      console.log("Resposta do servidor:", response);
      setResponse(response.data);
    } catch (err) {
      console.error("Erro ao testar endpoint:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };
  
  const testClienteById = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const id = prompt("Digite o ID do cliente");
      if (!id) {
        setLoading(false);
        return;
      }
      
      console.log(`Testando endpoint /api/Cliente/${id}...`);
      const response = await axios.get(`https://localhost:7234/api/Cliente/${id}`, {
        withCredentials: true
      });
      console.log("Resposta do servidor:", response);
      setResponse(response.data);
    } catch (err) {
      console.error("Erro ao testar endpoint:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-4">
      <h1>Teste de Endpoints</h1>
      
      <Card className="mb-4">
        <CardBody>
          <h2>Status CORS</h2>
          <Alert color={corsStatus.includes('✅') ? 'success' : corsStatus.includes('❌') ? 'danger' : 'info'}>
            {corsStatus}
          </Alert>
          <Button 
            color="primary" 
            onClick={testCors} 
            className="mb-3"
          >
            Testar CORS Novamente
          </Button>
        </CardBody>
      </Card>
      
      <Card className="mb-4">
        <CardBody>
          <h2>Endpoint Cliente</h2>
          
          <Row className="mb-3">
            <Col>
              <Button 
                color="primary" 
                onClick={testClientes} 
                className="me-2" 
                disabled={loading}
              >
                {loading ? <><Spinner size="sm" /> Testando...</> : 'Testar GET /api/Cliente'}
              </Button>
              
              <Button 
                color="info" 
                onClick={testClienteById} 
                disabled={loading}
              >
                {loading ? <><Spinner size="sm" /> Testando...</> : 'Testar GET /api/Cliente/{id}'}
              </Button>
            </Col>
          </Row>
          
          {error && (
            <Alert color="danger">
              <h4>Erro!</h4>
              <p>{error}</p>
            </Alert>
          )}
          
          {response && (
            <div>
              <h4>Resposta:</h4>
              <pre style={{ maxHeight: '500px', overflow: 'auto' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TestEndpoint;
