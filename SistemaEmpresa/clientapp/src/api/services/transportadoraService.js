import apiClient from '../client';

const TransportadoraService = {  getAll: async () => {
    try {
      const response = await apiClient.get('/api/Transportadora');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar transportadoras:', error);
      throw error;
    }
  },
    getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Transportadora/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar transportadora ${id}:`, error);
      throw error;
    }
  },
    create: async (transportadora) => {
    try {
      const response = await apiClient.post('/api/Transportadora', transportadora);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar transportadora:', error);
      throw error;
    }
  },
    update: async (id, transportadora) => {
    try {
      const response = await apiClient.put(`/api/Transportadora/${id}`, transportadora);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar transportadora ${id}:`, error);
      throw error;
    }
  },
    delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/Transportadora/${id}`);
      return { success: true, id };
    } catch (error) {
      console.error(`Erro ao excluir transportadora ${id}:`, error);
      throw error;
    }
  }
};

export default TransportadoraService;
