import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Table, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import CidadeService from '../../../api/services/cidadeService';
import EstadoService from '../../../api/services/estadoService';
import PaisService from '../../../api/services/paisService';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const CidadeList = () => {
  const [cidades, setCidades] = useState([]);
  const [cidadesFiltradas, setCidadesFiltradas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cidadeParaExcluir, setCidadeParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [paisFiltro, setPaisFiltro] = useState(null);
  const [estadosMap, setEstadosMap] = useState({});
  const [paisesMap, setPaisesMap] = useState({});
  // Função para buscar cidades com filtros aplicados
  const fetchCidades = async () => {
    try {
      setLoading(true);
      // Obter cidades da API - os dados já vêm normalizados do serviço
      const cidadesData = await CidadeService.getAll(estadoFiltro);
      
      console.log('Cidades obtidas do serviço:', cidadesData);
      
      // Não precisamos mais enriquecer os dados aqui, pois eles já vêm com
      // estadoNome e paisNome do serviço
      setCidades(cidadesData);
      aplicarFiltros(cidadesData, filtroSituacao, estadoFiltro, paisFiltro);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setError({ type: 'danger', message: 'Falha ao carregar as cidades. Por favor, tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para aplicar filtros na lista de cidades
  const aplicarFiltros = (data, filtroSit, estadoId, paisId) => {
    if (!data || !Array.isArray(data)) {
      setCidadesFiltradas([]);
      return;
    }
    
    let resultado = [...data];
    
    // Filtro por situação
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(cidade => Boolean(cidade.situacao));
        break;
        
      case 'inativos':
        resultado = resultado.filter(cidade => !Boolean(cidade.situacao));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por situação
    }
    
    // Filtro por estado
    if (estadoId) {
      resultado = resultado.filter(cidade => {
        // Verificar tanto o ID quanto se é um valor igual (string vs number)
        return cidade.estadoId === estadoId || String(cidade.estadoId) === String(estadoId);
      });
    }
    
    // Filtro por país (pode ser direto via paisId ou indireto via estado)
    if (paisId) {
      resultado = resultado.filter(cidade => {
        // Verificar se o país já está definido diretamente na cidade
        if (cidade.paisId && (cidade.paisId === paisId || String(cidade.paisId) === String(paisId))) {
          return true;
        }
        
        // Verificar via estado
        const estado = estadosMap[cidade.estadoId];
        if (estado && (estado.paisId === paisId || String(estado.paisId) === String(paisId))) {
          return true;
        }
        
        return false;
      });
    }
    
    // Ordenar por nome para melhor apresentação
    resultado = resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    
    console.log(`Aplicando filtros: Situação=${filtroSit}, Estado=${estadoId}, País=${paisId}`);
    console.log(`Resultado: ${resultado.length} cidades após filtros`);
    
    setCidadesFiltradas(resultado);
  };

  // Carregar estados filtrados pelo país selecionado
  useEffect(() => {
    const carregarEstados = async () => {
      try {
        const estadosData = await EstadoService.getAll(paisFiltro);
        setEstados(estadosData);
        
        // Se o estado atual não pertence ao país selecionado, resetar o filtro de estado
        if (paisFiltro && estadoFiltro) {
          const estadoAtual = estadosData.find(e => e.id === estadoFiltro);
          if (!estadoAtual) {
            setEstadoFiltro(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      }
    };
    
    carregarEstados();
  }, [paisFiltro]);
  // Carregar todos os dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Obter todos os estados
        const estadosData = await EstadoService.getAll();
        const estadosMapping = {};
        const paisesMapping = {};
        
        // Criar mapeamentos para rápida referência
        estadosData.forEach(estado => {
          estadosMapping[estado.id] = {
            nome: estado.nome,
            uf: estado.uf,
            paisId: estado.paisId
          };
          
          // Se o país ainda não estiver no mapa e o nome do país estiver disponível
          if (estado.paisNome && !paisesMapping[estado.paisId]) {
            paisesMapping[estado.paisId] = {
              nome: estado.paisNome
            };
          }
        });
        
        setEstadosMap(estadosMapping);
        setPaisesMap(paisesMapping);
        
        // Agora buscar as cidades
        const cidadesData = await CidadeService.getAll(estadoFiltro);
        
        // Log de verificação dos dados recebidos
        console.log('Cidades recebidas do serviço:', cidadesData);
        
        // Não precisamos mais enriquecer os dados aqui, pois eles já vêm com
        // estadoNome e paisNome do serviço
        setCidades(cidadesData);
        
        // Buscar países para os filtros dropdown
        const paisesData = await PaisService.getAll();
        setPaises(paisesData);
          // Log detalhado de cada cidade antes de aplicar os filtros
        console.log("Dados detalhados de cada cidade antes dos filtros:");
        cidadesData.forEach((cidade, index) => {
          console.log(`Cidade #${index+1}:`, {
            id: cidade.id,
            nome: cidade.nome,
            codigoIbge: cidade.codigoIbge,
            estadoId: cidade.estadoId,
            estadoNome: cidade.estadoNome,
            paisNome: cidade.paisNome,
            situacao: cidade.situacao
          });
        });
        
        // Aplicar filtros iniciais
        aplicarFiltros(cidadesData, filtroSituacao, estadoFiltro, paisFiltro);
        
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setError({ type: 'danger', message: 'Falha ao carregar os dados. Por favor, tente novamente mais tarde.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Adicionar listener para eventos de navegação e alterações de dados
    const handleDataChange = () => fetchCidades();
    window.addEventListener('focus', handleDataChange);
    window.addEventListener('dataChange', handleDataChange);
    
    return () => {
      window.removeEventListener('focus', handleDataChange);
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, []);
  
  // Aplicar filtros quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros(cidades, filtroSituacao, estadoFiltro, paisFiltro);
  }, [filtroSituacao, estadoFiltro, paisFiltro, cidades]);
  const handleDelete = async (id) => {
    try {
      // Usa o estado armazenado na variável para mostrar o nome em caso de erro
      const cidadeNome = cidadeParaExcluir?.nome;
      
      // Chamar o método delete do serviço
      await CidadeService.delete(id);
      
      // Fechar o modal e limpar o estado
      setModalOpen(false);
      setCidadeParaExcluir(null);
      
      // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Cidade "${cidadeNome}" excluída com sucesso!` });
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
      
      // Recarregar dados
      fetchCidades();
    } catch (err) {
      console.error('Erro ao excluir cidade:', err);
      
      let mensagemErro = "Não foi possível excluir a cidade.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (err.response && err.response.data && 
          typeof err.response.data === 'string' && 
          err.response.data.includes('foreign key constraint fails')) {
        mensagemErro = `Não é possível excluir a cidade "${cidadeParaExcluir.nome}" porque existem registros associados a ela.`;
      }
      
      setModalOpen(false);
      setCidadeParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };
  const openDeleteModal = (cidade) => {
    setCidadeParaExcluir(cidade);
    setModalOpen(true);
  };

  if (loading && !cidades.length) {
    return <div className="text-center my-5">Carregando...</div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Cidades</h3>
          <Link to="/localizacao/cidades/novo">
            <Button color="primary">
              + Nova Cidade
            </Button>
          </Link>
        </div>

        {error && (
          <Alert color={error.type === 'success' ? 'success' : 'danger'}>
            {error.message || error}
          </Alert>
        )}

        {/* Filtros */}
        <div className="mb-3">
          <div style={{ maxWidth: '100%' }} className="d-flex flex-column flex-md-row gap-3">
            {/* Filtro por situação */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="filtroSituacao">Filtrar por situação:</Label>
              <Input 
                type="select" 
                id="filtroSituacao" 
                value={filtroSituacao}
                onChange={(e) => setFiltroSituacao(e.target.value)}
                className="form-select mb-2"
              >
                <option value="ativos">Somente Ativos</option>
                <option value="inativos">Somente Inativos</option>
                <option value="todos">Todos</option>
              </Input>
            </div>
            
            {/* Filtro por país */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="paisFiltro">Filtrar por país:</Label>
              <Input 
                type="select" 
                id="paisFiltro"
                value={paisFiltro || ''}
                onChange={e => setPaisFiltro(e.target.value ? parseInt(e.target.value) : null)}
                className="form-select mb-2"
              >
                <option value="">Todos os Países</option>
                {paises.map(pais => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nome}
                  </option>
                ))}
              </Input>
            </div>
            
            {/* Filtro por estado */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="estadoFiltro">Filtrar por estado:</Label>
              <Input 
                type="select" 
                id="estadoFiltro"
                value={estadoFiltro || ''}
                onChange={e => setEstadoFiltro(e.target.value ? parseInt(e.target.value) : null)}
                className="form-select mb-2"
              >
                <option value="">Todos os Estados</option>
                {estados.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>
          
          <div className="text-muted mt-1">
            Exibindo {cidadesFiltradas.length} {cidadesFiltradas.length === 1 ? 'cidade' : 'cidades'}
            {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
            {paisFiltro ? ` no país selecionado` : ''}
            {estadoFiltro ? ` no estado selecionado` : ''}
          </div>
        </div>        <Table responsive striped>
          <thead>
            <tr>              <th>Cidade</th>
              <th>Código IBGE</th>
              <th>Estado</th>
              <th>País</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Última Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cidadesFiltradas.length > 0 ? 
              cidadesFiltradas.map(cidade => {
                // Log para rastrear o valor do codigoIbge antes de renderizar
                console.log(`Renderizando cidade ${cidade.id} - ${cidade.nome}`, {
                  codigoIbge: cidade.codigoIbge,
                  tipo: typeof cidade.codigoIbge,
                  valorBruto: cidade.codigoIbge,
                  // Adicionar logs para debugar a data de criação
                  dataCriacao: cidade.dataCriacao,
                  tipoDaCriacao: typeof cidade.dataCriacao,
                  valorBrutoDataCriacao: cidade.dataCriacao
                });
                
                return (
                  <tr key={cidade.id}>
                    <td>{cidade.nome || '-'}</td>
                    <td>{cidade.codigoIbge || '-'}</td>
                    <td>{cidade.estadoNome || '-'}</td>
                    <td>{cidade.paisNome || '-'}</td>
                    <td>
                      {Boolean(cidade.situacao) ? 
                        <span className="badge rounded-pill px-3 py-2 bg-success">Ativo</span> : 
                        <span className="badge rounded-pill px-3 py-2 bg-danger">Inativo</span>}
                    </td>                    <td>
                      {cidade.dataCriacao ? moment(cidade.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                      <small className="d-block text-muted">{cidade.userCriacao || 'Sistema'}</small>
                    </td>
                    <td>
                      {cidade.dataAlteracao ? moment(cidade.dataAlteracao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                      {cidade.dataAlteracao && <small className="d-block text-muted">{cidade.userAtualizacao || 'Sistema'}</small>}
                    </td>
                    <td>
                      <Link to={`/localizacao/cidades/detalhes/${cidade.id}`} className="btn btn-sm btn-primary me-2">
                        Detalhes
                      </Link>                      <Link to={`/localizacao/cidades/editar/${cidade.id}`} className="btn btn-sm btn-info me-2">
                        Editar
                      </Link>
                      
                      {Boolean(cidade.situacao) && (
                        // Botão de excluir (inativar) apenas para cidades ativas
                        <Button color="danger" size="sm" onClick={() => openDeleteModal(cidade)}>
                          Excluir
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
              : 
              <tr>
                <td colSpan="8" className="text-center">
                  {cidades.length === 0 ? 
                    "Nenhuma cidade cadastrada." : 
                    `Nenhuma cidade ${filtroSituacao === 'ativos' ? 'ativa' : filtroSituacao === 'inativas' ? 'inativa' : ''} encontrada${paisFiltro ? ' para o país selecionado' : ''}${estadoFiltro ? ' para o estado selecionado' : ''}.`}
                </td>
              </tr>
            }
          </tbody>
        </Table>
      </CardBody>
      <DeleteConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onDelete={() => handleDelete(cidadeParaExcluir?.id)}
        itemName={cidadeParaExcluir?.nome}
        itemType="cidade"
      />
    </Card>
  );
};

export default CidadeList;