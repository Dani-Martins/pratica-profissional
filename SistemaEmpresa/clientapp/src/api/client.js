import axios from 'axios';

// Configuração do cliente axios
const apiClient = axios.create({
  baseURL: '', // Vazio para usar URLs relativas - importante para deployment
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors para depuração aprimorada
apiClient.interceptors.request.use(
  config => {
    // Log mais detalhado da requisição
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    // Log mais detalhado da resposta bem-sucedida
    console.log(`[API Response Success] ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    // Log mais detalhado em caso de erro
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Para erros de validação do backend (código 400), imprima detalhes específicos
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.error('[API Validation Errors]', error.response.data.errors);
    }

    // Para erros internos do servidor (código 500)
    if (error.response?.status === 500) {
      console.error('[API Server Error]', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;