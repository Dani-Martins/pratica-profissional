import axios from 'axios';

class ClienteServiceClass {
  async getAll() {
    const response = await axios.get('/api/Cliente');
    return response.data;
  }

  async getById(id) {
    const response = await axios.get(`/api/Cliente/${id}`);
    return response.data;
  }

  async save(cliente) {
    if (cliente.id) {
      const response = await axios.put(`/api/Cliente/${cliente.id}`, cliente);
      return response.data;
    } else {
      const response = await axios.post('/api/Cliente', cliente);
      return response.data;
    }
  }

  async excluir(id) {
    const response = await axios.delete(`/api/Cliente/${id}`);
    return response.data;
  }
}

export const ClienteService = new ClienteServiceClass();