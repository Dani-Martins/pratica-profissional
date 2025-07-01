import React from 'react';
import ApiConnectionTest from '../../components/ApiTest/ApiConnectionTest';

const ApiTestPage = () => {
  return (
    <div>
      <h2 className="mb-4">Teste de Conexão com Backend</h2>
      <ApiConnectionTest />
    </div>
  );
};

export default ApiTestPage;