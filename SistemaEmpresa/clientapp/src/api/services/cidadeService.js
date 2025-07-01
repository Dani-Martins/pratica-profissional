import apiClient from '../client';

// Inicializar lista de cidades inativas
if (typeof window !== 'undefined') {
  try {
    const storedCidades = localStorage.getItem('cidadesInativas');
    window.cidadesInativas = storedCidades ? JSON.parse(storedCidades) : [];
  } catch (error) {
    console.error("Erro ao carregar cidades inativas:", error);
    window.cidadesInativas = [];
  }
}

// Verificar se uma cidade está na lista de inativas
const isCidadeInativa = (id) => {
  if (!window.cidadesInativas) return false;
  return window.cidadesInativas.includes(parseInt(id, 10));
};

// Marcar uma cidade como inativa na lista local
const marcarCidadeComoInativa = (id) => {
  const numId = Number(id);
  if (!window.cidadesInativas) {
    window.cidadesInativas = [];
  }
  
  if (!window.cidadesInativas.includes(numId)) {
    window.cidadesInativas.push(numId);
    
    try {
      localStorage.setItem('cidadesInativas', JSON.stringify(window.cidadesInativas));
    } catch (error) {
      console.error("Erro ao salvar lista de cidades inativas:", error);
    }
  }
};

// Remover uma cidade da lista de inativas
const removerCidadeInativa = (id) => {
  const idNumerico = Number(id);
  
  if (!window.cidadesInativas) {
    window.cidadesInativas = [];
    return;
  }
  
  if (window.cidadesInativas.includes(idNumerico)) {
    window.cidadesInativas = window.cidadesInativas.filter(cidadeId => cidadeId !== idNumerico);
    
    try {
      localStorage.setItem('cidadesInativas', JSON.stringify(window.cidadesInativas));
    } catch (error) {
      console.error("Erro ao salvar lista atualizada de cidades inativas:", error);
    }
  }
};

// Função auxiliar para normalizar o código IBGE de diferentes formatos
const normalizarCodigoIBGE = (cidade) => {
  if (!cidade) return '';
  
  // Primeiro log detalhado da cidade para identificar a estrutura exata
  console.log("Estrutura completa da cidade no normalizador:", JSON.stringify(cidade));
  
  // Verificar todas as possíveis variações do campo código IBGE
  if (cidade.codigo_ibge !== undefined && cidade.codigo_ibge !== null) {
    console.log("Usando código IBGE do campo codigo_ibge:", cidade.codigo_ibge);
    return cidade.codigo_ibge;
  } 
  if (cidade.CodigoIBGE !== undefined && cidade.CodigoIBGE !== null) {
    console.log("Usando código IBGE do campo CodigoIBGE:", cidade.CodigoIBGE);
    return cidade.CodigoIBGE;
  } 
  if (cidade.codigoIbge !== undefined && cidade.codigoIbge !== null) {
    console.log("Usando código IBGE do campo codigoIbge:", cidade.codigoIbge);
    return cidade.codigoIbge;
  } 
  if (cidade.CodigoIbge !== undefined && cidade.CodigoIbge !== null) {
    console.log("Usando código IBGE do campo CodigoIbge:", cidade.CodigoIbge);
    return cidade.CodigoIbge;
  }
  if (cidade.DDD !== undefined && cidade.DDD !== null) {
    console.log("Como último recurso, usando DDD:", cidade.DDD);
    return cidade.DDD;
  }
  
  // Tentar encontrar diretamente através das chaves do objeto
  const keys = Object.keys(cidade);
  console.log("Chaves disponíveis no objeto cidade:", keys);
  
  // Procurar por qualquer chave que possa conter "ibge" ou "IBGE"
  const ibgeKey = keys.find(key => 
    key.toLowerCase().includes('ibge') || 
    key.toLowerCase().includes('codigo') || 
    key.toLowerCase().includes('cod')
  );
  
  if (ibgeKey && cidade[ibgeKey] !== undefined && cidade[ibgeKey] !== null) {
    console.log(`Encontrado código IBGE na chave '${ibgeKey}':`, cidade[ibgeKey]);
    return cidade[ibgeKey];
  }
  
  console.log("Nenhum código IBGE encontrado nesta cidade");
  return '';
};

// Aplicar situação forçada a cidades inativas
const aplicarSituacaoForcada = (cidades) => {
  if (!Array.isArray(cidades)) return cidades;
  
  return cidades.map(cidade => {
    if (isCidadeInativa(cidade.id)) {
      return { ...cidade, situacao: false };
    }
    return cidade;
  });
};

const CidadeService = {
  getAll: async (estadoId = null) => {
    try {
      let url = '/api/Cidade';
      if (estadoId) {
        url += `?estadoId=${estadoId}`;
      }
      
      // Adicionar timestamp para evitar cache
      const timestamp = `${url.includes('?') ? '&' : '?'}_t=${new Date().getTime()}`;
      url += timestamp;
      
      // Configuração para evitar cache
      const config = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const response = await apiClient.get(url, config);
        // Log para verificar a estrutura exata dos dados recebidos
      console.log("Dados brutos recebidos da API:", response.data);
      
      // Verificar os campos de data em cada cidade
      if (Array.isArray(response.data) && response.data.length > 0) {
        const primeiroItem = response.data[0];
        console.log("Estrutura de datas disponíveis no primeiro item:", {
          data_criacao: primeiroItem.data_criacao,
          DataCriacao: primeiroItem.DataCriacao,
          dataCriacao: primeiroItem.dataCriacao,
          // Tentar identificar outros campos de data possíveis
          ...Object.keys(primeiroItem)
            .filter(key => key.toLowerCase().includes('data') || key.toLowerCase().includes('date') || key.toLowerCase().includes('criacao'))
            .reduce((obj, key) => {
              obj[key] = primeiroItem[key];
              return obj;
            }, {})
        });
      }
      
      // Normalizar os dados recebidos para garantir consistência
      const dadosNormalizados = Array.isArray(response.data) 
        ? response.data.map(cidade => {
            // Verificar a situação e convertê-la explicitamente para booleano
            const situacaoOriginal = 
                (cidade.Situacao !== undefined) ? cidade.Situacao : 
                (cidade.situacao !== undefined) ? cidade.situacao : 1; // Por padrão, consideramos ativo (1)
            
            // Forçar para boolean true se for qualquer valor truthy
            const situacao = Boolean(situacaoOriginal);
            
            // Log para diagnóstico completo
            console.log("Cidade bruta (JSON):", JSON.stringify(cidade));
            
            // Extrair campos específicos que sabemos existir ou são esperados
            let id = cidade.Id || cidade.id;
            let nome = cidade.Cidade || cidade.Nome || cidade.nome || '';
            
            // Lista de chaves do objeto para debug
            const chaves = Object.keys(cidade);
            console.log(`Chaves do objeto cidade ID=${id} nome=${nome}:`, chaves);
            
            // IMPORTANTE: Verificação direta do campo codigoIBGE
            let codigoIbge = null;
            
            // Verificar cada possibilidade explicitamente
            if (cidade.codigoIBGE !== undefined) {
              codigoIbge = cidade.codigoIBGE;
              console.log(`Usando codigoIBGE: ${codigoIbge}`);
            } else if (cidade.CodigoIBGE !== undefined) {
              codigoIbge = cidade.CodigoIBGE;
              console.log(`Usando CodigoIBGE: ${codigoIbge}`);
            } else if (cidade.codigoIbge !== undefined) {
              codigoIbge = cidade.codigoIbge;
              console.log(`Usando codigoIbge: ${codigoIbge}`);
            } else if (cidade.codigo_ibge !== undefined) {
              codigoIbge = cidade.codigo_ibge;
              console.log(`Usando codigo_ibge: ${codigoIbge}`);
            } else {
              console.log("Nenhum campo de código IBGE encontrado, verificando estado...");
              
              // Último caso: verificar no objeto estado
              if (cidade.estado && cidade.estado.codigoIbge) {
                codigoIbge = cidade.estado.codigoIbge;
                console.log(`Usando codigoIbge do estado: ${codigoIbge}`);
              } else if (cidade.Estado && cidade.Estado.CodigoIBGE) {
                codigoIbge = cidade.Estado.CodigoIBGE;
                console.log(`Usando CodigoIBGE do estado: ${codigoIbge}`);
              } else {
                codigoIbge = '';
                console.log("Nenhum código IBGE encontrado");
              }
            }
            
            let estadoId = null;
            let estadoNome = '-';
            let paisNome = '-';
            
            // Verificar se temos um ID de estado ou nome diretamente
            if (cidade.Estado_id) {
                estadoId = cidade.Estado_id;
            } else if (cidade.EstadoId) {
                estadoId = cidade.EstadoId;
            } else if (cidade.estado_id) {
                estadoId = cidade.estado_id;
            } else if (cidade.estadoId) { // Adicionar esta verificação extra para estadoId
                estadoId = cidade.estadoId;
            }
            
            // Validar e converter o estadoId se necessário
            if (estadoId !== null) {
                if (typeof estadoId === 'string') {
                    const parsedId = parseInt(estadoId, 10);
                    estadoId = !isNaN(parsedId) ? parsedId : null;
                } else if (typeof estadoId !== 'number') {
                    estadoId = null;
                }
            }
            
            // Verificar se temos um nome de estado diretamente
            if (cidade.Estado) {
                estadoNome = typeof cidade.Estado === 'string' ? cidade.Estado : 
                             (cidade.Estado.Nome || cidade.Estado.nome || '');
                             
                // Se Estado tem país, capturar também
                if (cidade.Estado.Pais || cidade.Estado.pais) {
                    const paisObj = cidade.Estado.Pais || cidade.Estado.pais;
                    paisNome = paisObj.Nome || paisObj.nome || '-';
                }
            } else if (cidade.estado) {
                estadoNome = typeof cidade.estado === 'string' ? cidade.estado : 
                             (cidade.estado.Nome || cidade.estado.nome || '');
                             
                // Se estado tem país, capturar também
                if (cidade.estado.Pais || cidade.estado.pais) {
                    const paisObj = cidade.estado.Pais || cidade.estado.pais;
                    paisNome = paisObj.Nome || paisObj.nome || '-';
                }
            } else if (cidade.EstadoNome) {
                estadoNome = cidade.EstadoNome;
            } else if (cidade.estado_nome) {
                estadoNome = cidade.estado_nome;
            }
            
            // Verificar se temos um nome de país diretamente
            if (cidade.Pais) {
                paisNome = typeof cidade.Pais === 'string' ? cidade.Pais : 
                           (cidade.Pais.Nome || cidade.Pais.nome || '-');
            } else if (cidade.pais) {
                paisNome = typeof cidade.pais === 'string' ? cidade.pais : 
                           (cidade.pais.Nome || cidade.pais.nome || '-');
            } else if (cidade.PaisNome) {
                paisNome = cidade.PaisNome;
            } else if (cidade.pais_nome) {
                paisNome = cidade.pais_nome;
            }
            
            console.log("Valores normalizados:", { 
                id, nome, codigoIbge, estadoId, estadoNome, paisNome, situacao 
            });              // Normalizar a data de criação
              let dataCriacao = null;
              
              // Verificar explicitamente todas as variações possíveis da data de criação
              if (cidade.data_criacao) {
                dataCriacao = cidade.data_criacao;
                console.log(`Usando data_criacao: ${dataCriacao}`);
              } else if (cidade.DataCriacao) {
                dataCriacao = cidade.DataCriacao;
                console.log(`Usando DataCriacao: ${dataCriacao}`);
              } else if (cidade.dataCriacao) {
                dataCriacao = cidade.dataCriacao;
                console.log(`Usando dataCriacao: ${dataCriacao}`);
              } else {
                console.log("Nenhuma data de criação encontrada");
              }
              
              // Objeto cidade normalizado
              const cidadeNormalizada = {
                id,
                nome,
                codigoIbge,
                estadoId,
                estadoNome,
                paisNome,
                situacao,
                dataCriacao,
                dataAtualizacao: cidade.data_atualizacao || cidade.DataAtualizacao || cidade.dataAtualizacao || null,
              };
              
              console.log("Cidade normalizada com data:", cidadeNormalizada);
              return cidadeNormalizada;
          })
        : [];
      
      // Aplicar a função que força a situação de cidades inativas
      const dadosCorrigidos = aplicarSituacaoForcada(dadosNormalizados);
      console.log("Cidades com situação forçada:", dadosCorrigidos);
      
      return dadosCorrigidos;
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      throw error;
    }  },
  
  getById: async (cidadeId, expand = true) => {
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = `_t=${new Date().getTime()}`;
      
      // Adicionar parâmetro para expandir informações de estado
      const url = expand 
        ? `/api/Cidade/${cidadeId}?expand=estado&${timestamp}` 
        : `/api/Cidade/${cidadeId}?${timestamp}`;
      
      const response = await apiClient.get(url);
      
      console.log("Dados brutos recebidos da API (getById):", response.data);
      
      // Extrair os mesmos campos usando a mesma lógica do getAll
      const cidade = response.data;
      
      // Verificar a situação e convertê-la explicitamente para booleano
      const situacaoOriginal = 
          (cidade.Situacao !== undefined) ? cidade.Situacao : 
          (cidade.situacao !== undefined) ? cidade.situacao : 1;
          
      // Forçar para boolean true se for qualquer valor truthy
      const situacao = Boolean(situacaoOriginal);
      
      // Extrair campos específicos que sabemos existir ou são esperados
      let id = cidade.Id || cidade.id || cidadeId; // Usar cidadeId como fallback
      let nome = cidade.Cidade || cidade.Nome || cidade.nome || '';
      let codigoIbge = normalizarCodigoIBGE(cidade);
      let estadoId = null;
      let estadoNome = '-';
      let paisNome = '-';
      
      // Verificar se temos um ID de estado ou nome diretamente
      if (cidade.Estado_id) {
          estadoId = cidade.Estado_id;
      } else if (cidade.EstadoId) {
          estadoId = cidade.EstadoId;
      } else if (cidade.estado_id) {
          estadoId = cidade.estado_id;
      } else if (cidade.estadoId) { // Adicionar esta verificação extra para estadoId
          estadoId = cidade.estadoId;
      }
      
      // Validar e converter o estadoId se necessário
      if (estadoId !== null) {
          if (typeof estadoId === 'string') {
              const parsedId = parseInt(estadoId, 10);
              estadoId = !isNaN(parsedId) ? parsedId : null;
          } else if (typeof estadoId !== 'number') {
              estadoId = null;
          }
      }
      
      // Verificar se temos um nome de estado diretamente
      if (cidade.Estado) {
          estadoNome = typeof cidade.Estado === 'string' ? cidade.Estado : 
                       (cidade.Estado.Nome || cidade.Estado.nome || '');
                       
          // Se Estado tem país, capturar também
          if (cidade.Estado.Pais || cidade.Estado.pais) {
              const paisObj = cidade.Estado.Pais || cidade.Estado.pais;
              paisNome = paisObj.Nome || paisObj.nome || '-';
          }
      } else if (cidade.estado) {
          estadoNome = typeof cidade.estado === 'string' ? cidade.estado : 
                       (cidade.estado.Nome || cidade.estado.nome || '');
                       
          // Se estado tem país, capturar também
          if (cidade.estado.Pais || cidade.estado.pais) {
              const paisObj = cidade.estado.Pais || cidade.estado.pais;
              paisNome = paisObj.Nome || paisObj.nome || '-';
          }
      } else if (cidade.EstadoNome) {
          estadoNome = cidade.EstadoNome;
      } else if (cidade.estado_nome) {
          estadoNome = cidade.estado_nome;
      }
      
      // Verificar se temos um nome de país diretamente
      if (cidade.Pais) {
          paisNome = typeof cidade.Pais === 'string' ? cidade.Pais : 
                     (cidade.Pais.Nome || cidade.Pais.nome || '-');
      } else if (cidade.pais) {
          paisNome = typeof cidade.pais === 'string' ? cidade.pais : 
                     (cidade.pais.Nome || cidade.pais.nome || '-');
      } else if (cidade.PaisNome) {
          paisNome = cidade.PaisNome;
      } else if (cidade.pais_nome) {
          paisNome = cidade.pais_nome;
      }
      
      const dadosNormalizados = {
        id: id,
        nome,
        codigoIbge,
        estadoId,
        estadoNome,
        paisNome,
        situacao,
        dataCriacao: cidade.data_criacao || cidade.DataCriacao || cidade.dataCriacao || null,
        dataAtualizacao: cidade.data_atualizacao || cidade.DataAtualizacao || cidade.dataAtualizacao || null,
      };
      
      // Verificar se a cidade está na lista local de inativas
      if (isCidadeInativa(id)) {
        dadosNormalizados.situacao = false;
        console.log(`Cidade ${id} está na lista local de inativas. Forçando situacao=false`);
      }
      
      return dadosNormalizados;
    } catch (error) {
      console.error(`Erro ao buscar cidade ${cidadeId}:`, error);
      throw error;
    }
  },
    create: async (cidade) => {
    try {
      // Formatar o objeto para incluir o campo Situacao
      const cidadeCreateDTO = {
        ...cidade,
        Situacao: cidade.situacao // Adicionar campo situacao no DTO
      };
      
      console.log('Dados preparados para criação de cidade:', cidadeCreateDTO);
      const response = await apiClient.post('/api/Cidade', cidadeCreateDTO);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      throw error;
    }
  },update: async (id, cidade) => {
    try {
      console.log(`Dados a serem enviados para atualização de cidade (ID ${id}):`, cidade);
      
      // Verificar se a cidade está sendo reativada
      if (cidade.situacao === true) {
        // Remover da lista de inativas local
        removerCidadeInativa(id);
      }
        // Formatando os dados para o formato que o backend espera (CidadeUpdateDTO)
      const cidadeUpdateDTO = {
        Nome: cidade.nome,
        CodigoIBGE: cidade.codigoIBGE || cidade.codigoIbge || '',
        EstadoId: parseInt(cidade.estadoId),
        Situacao: cidade.situacao // Adicionando campo situacao ao DTO
      };
      
      console.log(`Dados preparados para API (update cidade ID ${id}):`, cidadeUpdateDTO);
      console.log(`Tipo de EstadoId: ${typeof cidadeUpdateDTO.EstadoId}`);
      console.log(`Tipo de CodigoIBGE: ${typeof cidadeUpdateDTO.CodigoIBGE}`);
      
      // Chamada à API
      const response = await apiClient.put(`/api/Cidade/${id}`, cidadeUpdateDTO);
      console.log(`Resposta da API (update cidade ID ${id}):`, response.data);
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar cidade ${id}:`, error);
      
      // Log detalhado para depuração
      if (error.response) {
        console.error('Resposta de erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/Cidade/${id}`);
      
      // Marcar a cidade como inativa localmente
      marcarCidadeComoInativa(id);
      
      // Notificar componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      console.log(`Cidade com ID ${id} marcada como inativa com sucesso`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao inativar cidade ${id}:`, error);
      throw error;
    }
  },

  // Método adicional para obter cidades por estado
  getByEstado: async (estadoId) => {
    const response = await apiClient.get(`/Cidade/porestado/${estadoId}`);
    return response.data;
  }
};

export default CidadeService;