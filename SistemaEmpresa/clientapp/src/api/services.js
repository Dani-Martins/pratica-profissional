import { createApiService } from './servicesFactory';
import apiClient from './client';

// Serviços existentes
export const ClienteService = createApiService('Cliente');
export const ProdutoService = createApiService('Produto');
export const VendaService = createApiService('Venda');
export const FormaPagamentoService = createApiService('FormaPagamento');
export const CondicaoPagamentoService = createApiService('CondicaoPagamento');

// Novo serviço para o Dashboard
export const DashboardService = {
  getClientesStats: async () => {
    const response = await apiClient.get('/Dashboard/clientes');
    return response.data;
  },
  getVendasStats: async () => {
    const response = await apiClient.get('/Dashboard/vendas');
    return response.data;
  },
  getProdutosStats: async () => {
    const response = await apiClient.get('/Dashboard/produtos');
    return response.data;
  }
};

// Serviço existente de relatórios
export const RelatorioService = {
  vendasPorPeriodo: async (dataInicio, dataFim) => {
    const response = await apiClient.get('/Relatorio/vendas', { 
      params: { dataInicio, dataFim } 
    });
    return response.data;
  }
};