const config = {
  // Certifique-se que esta URL está correta e o servidor está rodando nela
  apiBaseUrl: 'https://localhost:7234/api',
  timeout: 10000,
  isDevelopment: process.env.NODE_ENV === 'development'
};

export default config;