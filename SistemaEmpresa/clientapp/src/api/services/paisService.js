import apiClient from '../client';

// Função para normalizar dados recebidos da API (PascalCase → camelCase)
const normalizarDados = (data) => {
  // Se for um array, normalizar cada item
  if (Array.isArray(data)) {
    return data.map(item => normalizarDados(item));
  }
  
  // Se não for um objeto ou for nulo, retornar como está
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const resultado = {};
  
  // Para cada propriedade no objeto...
  Object.keys(data).forEach(key => {
    // Converter primeira letra para minúscula (PascalCase → camelCase)
    const newKey = key.charAt(0).toLowerCase() + key.slice(1);
    
    // Mapear campos específicos se necessário
    if (key === 'Codigo') {
      resultado.codigo = data[key]; 
      resultado.codigoTelefonico = data[key]; 
    } else if (key === 'Situacao') {
      // Garantir que situacao seja tratado como número
      if (data[key] !== null && data[key] !== undefined) {
        resultado.situacao = parseInt(data[key], 10);
      } else {
        resultado.situacao = 1; // Ativo por padrão
      }
    } else if (key === 'DataCriacao') {
      resultado.dataCriacao = data[key];
    } else if (key === 'UserCriacao') {
      resultado.userCriacao = data[key] || 'SISTEMA';
    } else {
      resultado[newKey] = data[key];
    }
  });
  
  return resultado;
};

// Inicializar lista de países inativos
if (typeof window !== 'undefined') {
  try {
    const storedPaises = localStorage.getItem('paisesInativos');
    window.paisesInativos = storedPaises ? JSON.parse(storedPaises) : [];
  } catch (error) {
    window.paisesInativos = [];
  }
}

// Verificar se um país está na lista de inativos
const isPaisInativo = (id) => {
  if (!window.paisesInativos) return false;
  return window.paisesInativos.includes(parseInt(id, 10));
};

// Marcar um país como inativo na lista local
const marcarPaisComoInativo = (id) => {
  const numId = Number(id);
  if (!window.paisesInativos) {
    window.paisesInativos = [];
  }
  
  if (!window.paisesInativos.includes(numId)) {
    window.paisesInativos.push(numId);
    
    try {
      localStorage.setItem('paisesInativos', JSON.stringify(window.paisesInativos));
    } catch (error) {
      console.error("Erro ao salvar lista de países inativos:", error);
    }
  }
};

// Remover um país da lista de inativos
const removerPaisInativo = (id) => {
  const idNumerico = Number(id);
  
  if (!window.paisesInativos) {
    window.paisesInativos = [];
    return;
  }
  
  if (window.paisesInativos.includes(idNumerico)) {
    window.paisesInativos = window.paisesInativos.filter(paisId => paisId !== idNumerico);
    
    try {
      localStorage.setItem('paisesInativos', JSON.stringify(window.paisesInativos));
    } catch (error) {
      console.error("Erro ao salvar lista atualizada de países inativos:", error);
    }
  }
};

// Aplicar situação forçada a países inativos
const aplicarSituacaoForcada = (paises) => {
  if (!Array.isArray(paises)) return paises;
  
  return paises.map(pais => {
    if (isPaisInativo(pais.id)) {
      return { ...pais, situacao: 0 };
    }
    return pais;
  });
};

const PaisService = {
  getAll: async () => {
    try {
      const timestamp = `?_t=${new Date().getTime()}`;
      const config = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const response = await apiClient.get(`/api/Pais${timestamp}`, config);
      const dadosNormalizados = normalizarDados(response.data);
      const dadosCorrigidos = aplicarSituacaoForcada(dadosNormalizados);
      
      return dadosCorrigidos;
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Pais/${id}`);
      let dadosNormalizados = normalizarDados(response.data);
      
      if (isPaisInativo(id)) {
        dadosNormalizados.situacao = 0;
      }
      
      return dadosNormalizados;
    } catch (error) {
      console.error(`Erro ao buscar país ${id}:`, error);
      throw error;
    }
  },
    create: async (paisData) => {
    try {
      // Garantir que temos valores válidos para todos os campos obrigatórios
      const dadosParaAPI = {
        Nome: paisData.nome,
        Sigla: paisData.sigla || '',
        Codigo: paisData.codigo || '',
        Situacao: Number(paisData.situacao) || 1,  // Padrão: ativo
        UserCriacao: paisData.userCriacao || 'SISTEMA'
      };
      
      console.log('Enviando para API:', dadosParaAPI);
      const response = await apiClient.post('/api/Pais', dadosParaAPI);
      console.log('Resposta da API:', response.data);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      // Retornar dados normalizados
      return normalizarDados(response.data);
    } catch (error) {
      console.error('Erro ao criar país:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, paisData) => {
    try {
      // Obter dados atuais
      const paisAtual = await PaisService.getById(id);
      
      // Verificar se estamos reativando um país inativo
      if (Number(paisAtual.situacao) === 0 && Number(paisData.situacao) === 1) {
        // Atualizar normalmente
        const dadosParaAPI = {
          Nome: paisData.nome,
          Sigla: paisData.sigla || '',
          Codigo: paisData.codigo || '',
          Situacao: 1, // Ativar o país
          UserAlteracao: paisData.userAlteracao || 'SISTEMA'
        };
        
        const response = await apiClient.put(`/api/Pais/${id}`, dadosParaAPI);
        const paisAtualizado = normalizarDados(response.data);
        
        // Remover da lista de inativos local
        removerPaisInativo(id);
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('dataChange'));
        
        return paisAtualizado;
      }
      
      // Para atualizações normais
      const dadosParaAPI = {
        Nome: paisData.nome,
        Sigla: paisData.sigla || '',
        Codigo: paisData.codigo || '',
        Situacao: Number(paisData.situacao),
        UserAlteracao: paisData.userAlteracao || 'SISTEMA'
      };
      
      const response = await apiClient.put(`/api/Pais/${id}`, dadosParaAPI);
      const paisAtualizado = normalizarDados(response.data);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      return paisAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar país ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/Pais/${id}`);
      
      // Marcar o país como inativo
      marcarPaisComoInativo(id);
      
      // Notificar componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      return normalizarDados(response.data);
    } catch (error) {
      console.error(`Erro ao excluir país ${id}:`, error);
      throw error;
    }
  },
  
  removerPaisInativo
};

export default PaisService;
