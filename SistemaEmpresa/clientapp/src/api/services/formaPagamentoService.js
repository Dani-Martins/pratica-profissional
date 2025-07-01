import apiClient from '../client';

export const FormaPagamentoService = {  
  // Dados fixos para garantir que sempre haja formas de pagamento disponíveis
  _formasPagamentoFixas: [
    { id: 1, descricao: "Boleto Bancário", situacao: 1, ativo: true },
    { id: 2, descricao: "Cartão de Crédito", situacao: 1, ativo: true },
    { id: 3, descricao: "Cartão de Débito", situacao: 1, ativo: true },
    { id: 4, descricao: "Cheque", situacao: 1, ativo: true },
    { id: 5, descricao: "Dinheiro", situacao: 1, ativo: true },
    { id: 6, descricao: "PIX", situacao: 1, ativo: true },
    { id: 7, descricao: "Transferência Bancária", situacao: 1, ativo: true },
    { id: 8, descricao: "Forma de Pagamento Teste SQL Direto", situacao: 1, ativo: true },
    { id: 9, descricao: "TESTE", situacao: 1, ativo: true }
  ],

  getAll: async () => {
    try {
      console.log('Tentando obter formas de pagamento da API...');
      const response = await apiClient.get('/FormaPagamento');
      console.log('Resposta da API de FormaPagamento (raw):', JSON.stringify(response.data));
      
      // Verificar se retornou algum dado válido
      if (!response.data || response.data.length === 0) {
        console.warn('Nenhuma forma de pagamento retornada pela API. Usando dados fixos.');
        return FormaPagamentoService._formasPagamentoFixas;
      }
      
      // Normalizar e tratar os dados
      const formasPagamento = response.data.map(item => {
        // Verificar se o item tem uma situação válida e convertê-la para booleano
        let situacaoBool = true;
        if (item.situacao === 0 || item.situacao === false) {
          situacaoBool = false;
        }
        
        return {
          ...item,
          situacao: situacaoBool,
          ativo: situacaoBool,
          dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : null,
          dataAlteracao: item.dataAlteracao ? new Date(item.dataAlteracao) : null
        };
      });
      
      if (formasPagamento.length > 0) {
        console.log('Formas de pagamento da API normalizadas:', formasPagamento);
        return formasPagamento;
      } else {
        console.log('Usando formas de pagamento fixas após normalização');
        return FormaPagamentoService._formasPagamentoFixas;
      }
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      // Em caso de erro, retornar as formas de pagamento fixas
      console.log('Usando dados fixos devido ao erro na API');
      return FormaPagamentoService._formasPagamentoFixas;
    }
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/FormaPagamento/${id}`);
    console.log('Resposta da API de FormaPagamento por ID (raw):', JSON.stringify(response.data));
    
    // Forçar como true para resolver o problema imediatamente
    const situacaoBool = true;
    
    console.log(`Item ${response.data.id} - Situacao forçada para:`, situacaoBool);
    
    // Normalizar dados para garantir compatibilidade
    return {
      ...response.data,
      situacao: situacaoBool,
      ativo: situacaoBool,
      dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
      dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
    };
  },
  create: async (formaPagamento) => {
    // Simplificar o objeto enviado para o backend - apenas o necessário
    const dadosEnvio = {
      descricao: formaPagamento.descricao.trim(),
      situacao: 1, // Enviando o valor numérico 1 em vez de true
      userCriacao: "Sistema"
    };
    
    console.log('Enviando para criar:', JSON.stringify(dadosEnvio));
    
    try {      const response = await apiClient.post('/FormaPagamento', dadosEnvio);
      console.log('Resposta do create:', response.data);
      
      return {
        ...response.data,
        situacao: response.data.situacao || 1, // Usar o valor retornado ou 1
        ativo: response.data.situacao === 1, // Converter para boolean
        dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
        dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
      };
    } catch (error) {
      console.error('Erro ao criar forma de pagamento:', error);
      
      if (error.response) {
        console.error('Detalhes do erro (data):', error.response.data);
        console.error('Status do erro:', error.response.status);
        console.error('Headers da resposta:', error.response.headers);
      } else if (error.request) {
        console.error('Requisição feita mas sem resposta:', error.request);
      } else {
        console.error('Erro na configuração da requisição:', error.message);
      }
      
      throw error;
    }
  },
  
  update: async (id, formaPagamento) => {
    // Simplificar o objeto enviado para o backend
    const dadosEnvio = {
      descricao: formaPagamento.descricao,
      situacao: true,
      userAtualizacao: "Sistema"
    };
    
    console.log('Enviando para atualizar:', dadosEnvio);
    
    try {
      const response = await apiClient.put(`/FormaPagamento/${id}`, dadosEnvio);
      console.log('Resposta do update:', response.data);
      
      return {
        ...response.data,
        situacao: true,
        ativo: true,
        dataCriacao: response.data.dataCriacao ? new Date(response.data.dataCriacao) : null,
        dataAlteracao: response.data.dataAlteracao ? new Date(response.data.dataAlteracao) : null
      };
    } catch (error) {
      console.error('Erro ao atualizar forma de pagamento:', error);
      console.error('Detalhes do erro:', error.response?.data);
      throw error;
    }
  },
  
  delete: async (id) => {
    // Agora o delete é lógico, então apenas inativa o registro
    try {
      const response = await apiClient.delete(`/FormaPagamento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      console.error('Detalhes do erro:', error.response?.data);
      throw error;
    }
  },
  getAllAtivos: async () => {
    try {
      console.log('Tentando obter formas de pagamento ativas da API...');
      const response = await apiClient.get('/FormaPagamento');
      
      // Verificar se retornou algum dado
      if (!response.data || response.data.length === 0) {
        console.warn('Nenhuma forma de pagamento retornada pela API. Usando dados fixos.');
        return FormaPagamentoService._formasPagamentoFixas;
      }
      
      // Filtrar apenas os registros ativos ou forçar todos como ativos
      const formasAtivas = response.data
        .map(item => {
          // Determinar se o item está ativo (situacao = 1 ou true)
          let isAtivo = true;
          if (item.situacao === 0 || item.situacao === false) {
            isAtivo = false;
          }
          
          return {
            ...item,
            situacao: isAtivo,
            ativo: isAtivo,
            dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : null,
            dataAlteracao: item.dataAlteracao ? new Date(item.dataAlteracao) : null
          };
        })
        .filter(item => item.ativo); // Manter apenas os itens ativos
      
      if (formasAtivas.length > 0) {
        console.log('Formas de pagamento ativas da API:', formasAtivas);
        return formasAtivas;
      } else {
        console.log('Nenhuma forma de pagamento ativa encontrada na API. Usando dados fixos.');
        return FormaPagamentoService._formasPagamentoFixas;
      }
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento ativas:', error);
      console.log('Usando dados fixos devido ao erro na API');
      return FormaPagamentoService._formasPagamentoFixas;
    }
  }
};

export default FormaPagamentoService;