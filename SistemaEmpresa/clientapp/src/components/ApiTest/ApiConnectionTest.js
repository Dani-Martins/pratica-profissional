import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Alert, Button, Spinner, Table } from 'reactstrap';
import axios from 'axios';

const ApiConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Teste HTTP sem interceptadores ou configurações complexas
  const testEndpoint = async (url) => {
    try {
      setLoading(true);
      console.log(`Testando conexão com: ${url}`);
      
      // Usando axios diretamente para evitar problemas de configuração
      const response = await axios.get(url, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error(`Erro ao testar ${url}:`, error);
      return {
        success: false,
        status: error.response?.status,
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setGlobalError(null);
    const results = {};

    try {
      // Testar ambas as portas para identificar qual funciona
      results.http5234 = await testEndpoint('http://localhost:5234/api/Diagnostico');
      results.https7234 = await testEndpoint('https://localhost:7234/api/Diagnostico');
      
      // Tentar endpoints básicos na porta que funcionou
      const workingPort = results.http5234.success ? '5234' : (results.https7234.success ? '7234' : null);
      const protocol = workingPort === '5234' ? 'http' : 'https';
      
      if (workingPort) {
        results.pais = await testEndpoint(`${protocol}://localhost:${workingPort}/api/Pais`);
        results.estado = await testEndpoint(`${protocol}://localhost:${workingPort}/api/Estado`);
        results.cidade = await testEndpoint(`${protocol}://localhost:${workingPort}/api/Cidade`);
      } else {
        setGlobalError("Não foi possível conectar a nenhuma das portas do backend.");
      }
      
      setTestResults(results);
    } catch (error) {
      setGlobalError(`Erro ao executar testes: ${error.message}`);
      console.error('Erro nos testes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="bg-primary text-white">
        Teste de Conexão com a API
      </CardHeader>
      <CardBody>
        <p className="mb-3">
          Esta ferramenta testa a conexão com o backend em ambas as portas (5234 e 7234) e 
          verifica os endpoints básicos.
        </p>
        
        <Button 
          color="primary" 
          onClick={runAllTests} 
          disabled={loading}
          className="mb-4"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Testando conexões...
            </>
          ) : (
            'Executar Testes de Conexão'
          )}
        </Button>

        {globalError && (
          <Alert color="danger" className="mb-4">
            <h5>Erro:</h5>
            <p>{globalError}</p>
          </Alert>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="results-container">
            <h5 className="mb-3">Resultados:</h5>
            
            <Table bordered striped>
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(testResults).map(([key, result]) => (
                  <tr key={key}>
                    <td>
                      <strong>{key}</strong>
                    </td>
                    <td>
                      <span className={`badge ${result.success ? 'bg-success' : 'bg-danger'}`}>
                        {result.success ? 'OK' : 'FALHA'}
                      </span>
                    </td>
                    <td>
                      {result.success ? (
                        <div>
                          <p className="mb-1">Status: {result.status}</p>
                          <small>
                            <details>
                              <summary>Dados recebidos</summary>
                              <pre className="bg-light p-2 mt-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          </small>
                        </div>
                      ) : (
                        <p className="text-danger mb-0">
                          {result.error} 
                          {result.status && <span> (Status: {result.status})</span>}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Alert color="info" className="mt-3">
              <h5>Próximos passos:</h5>
              <ul className="mb-0">
                <li>Se a conexão com a porta 5234 (HTTP) funcionar, atualize o client.js para usar HTTP</li>
                <li>Se apenas HTTPS (7234) funcionar, certifique-se de que seu client esteja configurado para ignorar erros de certificado</li>
                <li>Se nenhum funcionar, verifique se o backend está rodando e possui o controlador Diagnostico</li>
              </ul>
            </Alert>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ApiConnectionTest;
