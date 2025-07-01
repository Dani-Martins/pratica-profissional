import axios from 'axios';

class CondicaoPagamentoServiceClass {
  async getAll() {
    const response = await axios.get('/api/CondicaoPagamento');
    return response.data;
  }

  async getById(id) {
    const response = await axios.get(`/api/CondicaoPagamento/${id}`);
    return response.data;
  }

  async create(condicaoPagamento) {
    const response = await axios.post('/api/CondicaoPagamento', condicaoPagamento);
    return response.data;
  }

  async update(id, condicaoPagamento) {
    const response = await axios.put(`/api/CondicaoPagamento/${id}`, condicaoPagamento);
    return response.data;
  }

  async delete(id) {
    const response = await axios.delete(`/api/CondicaoPagamento/${id}`);
    return response.data;
  }
}

const CondicaoPagamentoService = new CondicaoPagamentoServiceClass();
export default CondicaoPagamentoService;
