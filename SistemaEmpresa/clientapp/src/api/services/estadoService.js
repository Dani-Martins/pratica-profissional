import apiClient from '../client';
import PaisService from './paisService';

// Melhorando a função de normalização
const normalizarDados = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => normalizarDados(item));
  }
  
  if (typeof data !== 'object') return data;
  
  // Cria um novo objeto para armazenar os dados normalizados
  const resultado = {};
  
  // Para cada propriedade no objeto original
  Object.keys(data).forEach(key => {
    // Garante que estamos lidando com a versão em camelCase da chave
    // Converte 'Nome' para 'nome', 'PaisId' para 'paisId', etc.
    const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
    
    // Processa o valor baseado em seu tipo
    if (data[key] === null) {
      resultado[camelCaseKey] = null;
    } else if (Array.isArray(data[key])) {
      resultado[camelCaseKey] = data[key].map(item => 
        typeof item === 'object' && item !== null ? normalizarDados(item) : item
      );
    } else if (typeof data[key] === 'object') {
      resultado[camelCaseKey] = normalizarDados(data[key]);    } else if (camelCaseKey === 'situacao') {
      // Converter o valor para um booleano verdadeiro, independentemente do formato
      // Mostramos também o valor original em um campo separado para debug
      const value = data[key];
      resultado['situacaoOriginal'] = value; // Manter o valor original para debug
      
      // Se for um valor numérico, string numérica, ou booleano true
      // Marcaremos como true apenas se for exatamente 1 ou true
      if (value === 1 || value === true) {
        resultado[camelCaseKey] = true;
      } else {
        resultado[camelCaseKey] = false;
      }
    } else {
      resultado[camelCaseKey] = data[key];
    }
  });
  
  return resultado;
};

// Função para preparar dados para envio à API
const prepareDadosParaAPI = (data) => {
  if (!data) return null;
  
  const resultado = {};
  Object.keys(data).forEach(key => {
    // Converte para PascalCase para a API .NET
    const newKey = key.charAt(0).toUpperCase() + key.slice(1);
    resultado[newKey] = data[key];
  });
  
  return resultado;
};

// Inicializar lista de estados inativos
if (typeof window !== 'undefined') {
  try {
    const storedEstados = localStorage.getItem('estadosInativos');
    window.estadosInativos = storedEstados ? JSON.parse(storedEstados) : [];
  } catch (error) {
    console.error("Erro ao carregar estados inativos:", error);
    window.estadosInativos = [];
  }
}

// Verificar se um estado está na lista de inativos
const isEstadoInativo = (id) => {
  if (!window.estadosInativos) return false;
  return window.estadosInativos.includes(parseInt(id, 10));
};

// Marcar um estado como inativo na lista local
const marcarEstadoComoInativo = (id) => {
  const numId = Number(id);
  if (!window.estadosInativos) {
    window.estadosInativos = [];
  }
  
  if (!window.estadosInativos.includes(numId)) {
    window.estadosInativos.push(numId);
    
    try {
      localStorage.setItem('estadosInativos', JSON.stringify(window.estadosInativos));
    } catch (error) {
      console.error("Erro ao salvar lista de estados inativos:", error);
    }
  }
};

// Remover um estado da lista de inativos
const removerEstadoInativo = (id) => {
  const idNumerico = Number(id);
  
  if (!window.estadosInativos) {
    window.estadosInativos = [];
    return;
  }
  
  if (window.estadosInativos.includes(idNumerico)) {
    window.estadosInativos = window.estadosInativos.filter(estadoId => estadoId !== idNumerico);
    
    try {
      localStorage.setItem('estadosInativos', JSON.stringify(window.estadosInativos));
    } catch (error) {
      console.error("Erro ao salvar lista atualizada de estados inativos:", error);
    }
  }
};

// Aplicar situação forçada a estados inativos
const aplicarSituacaoForcada = (estados) => {
  if (!Array.isArray(estados)) return estados;
  
  return estados.map(estado => {
    if (isEstadoInativo(estado.id)) {
      return { ...estado, situacao: false };
    }
    return estado;
  });
};

// Método que normaliza os dados dos estados
const normalizeData = (data, paises) => {
  console.log('Dados brutos recebidos da API:', data);
  
  return data.map(estado => {
    // Encontrar o país correspondente pelo ID
    const paisCorrespondente = paises.find(p => p.id === estado.paisId);
    
    return {
      id: estado.id,
      nome: estado.nome,
      uf: estado.uf,
      paisId: estado.paisId,
      // Usar o nome do país encontrado ou 'N/A' se não encontrar
      paisNome: paisCorrespondente ? paisCorrespondente.nome : 'N/A'
    };
  });
};

const EstadoService = {
  // Modificar o método getAll
  getAll: async (paisId = null) => {
    try {
      // Primeiro, buscar todos os países para ter os dados disponíveis
      const paises = await PaisService.getAll();
      console.log("Paises disponíveis:", paises);
      
      // Se um paisId for especificado, filtra por país, senão busca todos
      const timestamp = `?_t=${new Date().getTime()}`;
      const url = paisId ? `/api/Estado/porPais/${paisId}${timestamp}` : `/api/Estado${timestamp}`;
      console.log(`Buscando estados ${paisId ? 'do país '+paisId : 'de todos os países'}`);
      
      const config = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const response = await apiClient.get(url, config);
      
      // Associar o nome do país a cada estado usando a lista de países
      const dadosNormalizados = Array.isArray(response.data) 
        ? response.data.map(estado => {
            // Procurar o país correspondente pelo ID
            const paisCorrespondente = paises.find(p => p.id === estado.paisId || p.id === estado.PaisId);
            
            // Verificar a situação e convertê-la explicitamente para booleano
            // Capturar todas as possíveis variações do campo situação
            const situacaoOriginal = 
                (estado.Situacao !== undefined) ? estado.Situacao : 
                (estado.situacao !== undefined) ? estado.situacao : 1; // Por padrão, consideramos ativo (1)
            
            // Forçar para boolean true se for qualquer valor truthy,
            // principalmente 1, '1', true ou valores não nulos/undefined
            const situacao = Boolean(situacaoOriginal);
            
            return {
              id: estado.Id || estado.id,
              nome: estado.Nome || estado.nome,
              uf: estado.UF || estado.Uf || estado.uf,
              paisId: estado.PaisId || estado.paisId,
              // Aqui forçamos para true se situacaoOriginal for qualquer valor truthy (1, "1", true, etc)
              situacao: situacao,
              dataCriacao: estado.DataCriacao || estado.dataCriacao,
              dataAtualizacao: estado.DataAtualizacao || estado.dataAtualizacao,
              userCriacao: estado.UserCriacao || estado.userCriacao,
              userAtualizacao: estado.UserAtualizacao || estado.userAtualizacao,
              // Usar o nome do país encontrado
              paisNome: paisCorrespondente ? paisCorrespondente.nome : 'N/A'
            };
          })
        : [];
      
      // Aplicar a função que força a situação de estados inativos
      const dadosCorrigidos = aplicarSituacaoForcada(dadosNormalizados);
      console.log("Estados com situação forçada:", dadosCorrigidos);
      
      return dadosCorrigidos;
    } catch (error) {
      console.error("Erro ao obter estados:", error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      console.log(`Buscando estado com ID ${id}`);
      const response = await apiClient.get(`/api/Estado/${id}`);
      console.log("Resposta da API:", response.data);
      
      // Normalizar os dados para garantir que todos os campos necessários estejam presentes
      const dadosNormalizados = {
        id: response.data.Id || response.data.id,
        nome: response.data.Nome || response.data.nome,
        uf: response.data.UF || response.data.Uf || response.data.uf,
        paisId: response.data.PaisId || response.data.paisId,
        paisNome: response.data.PaisNome || response.data.paisNome,
        situacao: Boolean(response.data.Situacao || response.data.situacao),
        dataCriacao: response.data.DataCriacao || response.data.dataCriacao,
        dataAtualizacao: response.data.DataAtualizacao || response.data.dataAtualizacao,
        userCriacao: response.data.UserCriacao || response.data.userCriacao,
        userAtualizacao: response.data.UserAtualizacao || response.data.userAtualizacao
      };
      
      // Verificar se o estado está na lista local de inativos
      if (isEstadoInativo(id)) {
        dadosNormalizados.situacao = false;
        console.log(`Estado ${id} está na lista local de inativos. Forçando situacao=false`);
      }
      
      return dadosNormalizados;
    } catch (error) {
      console.error(`Erro ao buscar estado ${id}:`, error);
      throw error;
    }
  },
  
  getByPaisId: async (paisId) => {
    try {
      console.log(`Chamando API para obter estados do país ${paisId}`);
      const response = await apiClient.get(`/api/Estado/porPais/${paisId}`);
      console.log(`Dados recebidos da API (estados do país ${paisId}):`, response.data);
      const dadosNormalizados = normalizarDados(response.data);
      console.log(`Dados normalizados (estados do país ${paisId}):`, dadosNormalizados);
      return dadosNormalizados;
    } catch (error) {
      console.error(`Erro ao obter estados do país ${paisId}:`, error);
      throw error;
    }
  },
  
  create: async (estadoData) => {
    try {
      console.log("Dados a serem enviados para criação de estado:", estadoData);
      const dadosParaAPI = prepareDadosParaAPI(estadoData);
      console.log("Dados preparados para API (create estado):", dadosParaAPI);
      const response = await apiClient.post('/api/Estado', dadosParaAPI);
      return normalizarDados(response.data);
    } catch (error) {
      console.error("Erro ao criar estado:", error);
      throw error;
    }
  },
    update: async (id, estadoData) => {
    try {
      console.log(`Dados a serem enviados para atualização de estado (ID ${id}):`, estadoData);
      
      // Verificar se o estado está sendo reativado
      if (estadoData.situacao === true) {
        // Remover da lista de inativos local
        removerEstadoInativo(id);
      }
      
      const dadosParaAPI = prepareDadosParaAPI(estadoData);
      console.log(`Dados preparados para API (update estado ID ${id}):`, dadosParaAPI);
      const response = await apiClient.put(`/api/Estado/${id}`, dadosParaAPI);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      return normalizarDados(response.data);
    } catch (error) {
      console.error(`Erro ao atualizar estado ${id}:`, error);
      throw error;
    }
  },
    delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/Estado/${id}`);
      
      // Marcar o estado como inativo localmente
      marcarEstadoComoInativo(id);
      
      // Notificar componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      console.log(`Estado com ID ${id} marcado como inativo com sucesso`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao inativar estado ${id}:`, error);
      throw error;
    }
  }
};

export default EstadoService;