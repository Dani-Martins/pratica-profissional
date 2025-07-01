import apiClient from '../client';

const ProdutoService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Produto');
      console.log('Dados de produtos recebidos:', response.data);
      
      return response.data.map(item => ({
        ...item,
        dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : null,
        dataAlteracao: item.dataAlteracao ? new Date(item.dataAlteracao) : null
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Produto/${id}`);
      console.log(`Produto ${id} recebido:`, response.data);
      
      return {
        ...response.data,
        dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
        dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
      };
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      throw error;
    }
  },
  
  create: async (produto) => {
    try {      
      // Preparar os dados para envio
      const dadosEnvio = {
        ...produto,
        userCriacao: "Sistema"
      };
      
      console.log('Enviando dados para criar produto:', dadosEnvio);
      const response = await apiClient.post('/api/Produto', dadosEnvio);
      
      return {
        ...response.data,
        dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
        dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
      };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },
  
  update: async (id, produto) => {
    try {
      // Preparar os dados para envio
      const dadosEnvio = {
        ...produto,
        userAtualizacao: "Sistema"
      };
      
      console.log(`Enviando dados para atualizar produto ${id}:`, dadosEnvio);
      const response = await apiClient.put(`/api/Produto/${id}`, dadosEnvio);
      
      return {
        ...response.data,
        dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
        dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
      };
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      // Inativação lógica (soft delete)
      console.log(`Inativando produto ${id}`);
      const response = await apiClient.delete(`/api/Produto/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir produto ${id}:`, error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },
  
  search: async (query) => {
    try {
      const response = await apiClient.get(`/api/Produto/search?query=${encodeURIComponent(query)}`);
      return response.data.map(item => ({
        ...item,
        dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : null,
        dataAlteracao: item.dataAlteracao ? new Date(item.dataAlteracao) : null
      }));
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      throw error;
    }
  }
};

export default ProdutoService;
