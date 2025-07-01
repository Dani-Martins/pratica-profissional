import axios from 'axios';

// Função para testar a conexão diretamente (sem usar o cliente configurado)
export const testDirectConnection = async (endpoint) => {
  try {
    console.log(`Testando conexão direta com: https://localhost:7234/api${endpoint}`);
    
    const response = await axios.get(`https://localhost:7234/api${endpoint}`, {
      headers: { 'Accept': 'application/json' }
      // Removemos a parte do httpsAgent que usa o módulo 'https'
    });
    
    console.log('Conexão direta bem-sucedida:', response.status);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Erro na conexão direta:', error.message);
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export default {
  testDirectConnection
};