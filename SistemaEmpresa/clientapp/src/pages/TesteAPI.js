import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner, Alert, Row, Col } from 'reactstrap';
import apiClient from '../api/client';

const TesteAPI = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState([
    '/Pais', 
    '/Estado', 
    '/Cidade',
    '/Diagnostico',
    '/Dashboard/clientes',
    '/Dashboard/vendas',
    '/Dashboard/produtos'
  ]);

  useEffect(() => {
    testarTodosEndpoints();
  }, []);

  const testarTodosEndpoints = async () => {
    setLoading(true);
    const newResults = {};
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testando endpoint: ${endpoint}`);
        const response = await apiClient.get(endpoint);
        newResults[endpoint] = {
          success: true,
          data: response.data,
          status: response.status
        };
        console.log(`Endpoint ${endpoint} funcionou!`);
      } catch (error) {
        console.error(`Erro no endpoint ${endpoint}:`, error);
        newResults[endpoint] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
      }
    }
    
    setResults(newResults);
    setLoading(false);
  };

  const testSimpleEndpoint = async () => {
    try {
      const response = await apiClient.get('/Pais');
      console.log('Resposta direta da API:', response.data);
      alert('API respondeu com sucesso! Veja o console.');
    } catch (error) {
      console.error('Erro de teste:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3>Diagnóstico de Conexão com a API (porta 7234)</h3>
      </CardHeader>
      <CardBody>
        <div className="mb-3">
          <Button 
            color="primary" 
            onClick={testarTodosEndpoints} 
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Testar Todos os Endpoints'}
          </Button>
          
          <Button color="warning" onClick={testSimpleEndpoint}>
            Testar GET /Pais
          </Button>
          
          <small className="text-muted d-block mt-2">
            Isto testará todos os endpoints básicos da API para identificar quais estão funcionando.
          </small>
        </div>

        {loading ? (
          <div className="text-center my-4">
            <Spinner color="primary" />
            <p>Testando conexão com a API...</p>
          </div>
        ) : (
          <div>
            <h4>Resultados dos testes:</h4>
            
            {Object.keys(results).length > 0 ? (
              <div className="mt-3">
                {Object.keys(results).map(endpoint => (
                  <div key={endpoint} className="mb-4">
                    <h5>
                      Endpoint: <code>{endpoint}</code>
                      <span className={`ms-2 badge ${results[endpoint].success ? 'bg-success' : 'bg-danger'}`}>
                        {results[endpoint].success ? 'OK' : 'FALHA'}
                      </span>
                    </h5>
                    
                    {results[endpoint].success ? (
                      <div>
                        <p>Status: {results[endpoint].status}</p>
                        <div className="bg-light p-3 border rounded" style={{maxHeight: '200px', overflow: 'auto'}}>
                          <pre>{JSON.stringify(results[endpoint].data, null, 2)}</pre>
                        </div>
                      </div>
                    ) : (
                      <Alert color="danger">
                        <p>Erro: {results[endpoint].error}</p>
                        <p>Status: {results[endpoint].status || 'N/A'}</p>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum resultado disponível.</p>
            )}
          </div>
        )}
        
        <hr className="my-4" />
        
        <div className="alert alert-info">
          <h5>Dicas para solucionar problemas:</h5>
          <ol>
            <li>Certifique-se que o servidor backend está rodando na porta 7234</li>
            <li>Acesse o Swagger diretamente em <a href="https://localhost:7234/swagger" target="_blank">https://localhost:7234/swagger</a></li>
            <li>Teste os endpoints manualmente pelo Swagger para verificar se estão funcionando</li>
            <li>Verifique os logs do servidor backend para identificar erros 500</li>
          </ol>
        </div>
      </CardBody>
    </Card>
  );
};

export default TesteAPI;