import axios from 'axios';

const API_URL = '/api/unidademedida';

const UnidadeMedidaService = {
  getAll: () => axios.get(API_URL).then(res => res.data),
  getById: (id) => axios.get(`${API_URL}/${id}`).then(res => res.data),
  create: (data) => axios.post(API_URL, data).then(res => res.data),
  update: (id, data) => axios.put(`${API_URL}/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`${API_URL}/${id}`).then(res => res.data),
};

export default UnidadeMedidaService;
