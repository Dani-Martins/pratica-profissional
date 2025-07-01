import axios from 'axios';

class FornecedorServiceClass {
  async getAll() {
    const response = await axios.get('/api/Fornecedor');
    return response.data;
  }

  async getById(id) {
    const response = await axios.get(`/api/Fornecedor/${id}`);
    return response.data;
  }

  async save(fornecedor) {
    if (fornecedor.id) {
      const response = await axios.put(`/api/Fornecedor/${fornecedor.id}`, fornecedor);
      return response.data;
    } else {
      const response = await axios.post('/api/Fornecedor', fornecedor);
      return response.data;
    }
  }

  async excluir(id) {
    const response = await axios.delete(`/api/Fornecedor/${id}`);
    return response.data;
  }
}

export const FornecedorService = new FornecedorServiceClass();
