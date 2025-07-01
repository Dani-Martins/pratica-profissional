import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Table, Alert, Input, Label } from 'reactstrap';
import EstadoService from '../../../api/services/estadoService';
import PaisService from '../../../api/services/paisService';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const EstadoList = () => {
  const [estados, setEstados] = useState([]);
  const [estadosFiltrados, setEstadosFiltrados] = useState([]);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  const [filtroPais, setFiltroPais] = useState(''); // Filtro adicional por país
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [estadoParaExcluir, setEstadoParaExcluir] = useState(null);

  // Função para buscar todos os estados e países
  const fetchData = async () => {
    setLoading(true);
    try {      // Buscar dados atualizados de estados e países em paralelo
      const [estadosData, paisesData] = await Promise.all([
        EstadoService.getAll(),
        PaisService.getAll()
      ]);
        // Processar dados sem modificar os valores de situacao
      const estadosProcessados = estadosData || [];      // Atualizar o estado com os novos dados
      setEstados(estadosProcessados);
      setPaises(paisesData || []);
      aplicarFiltros(estadosProcessados, filtroSituacao, filtroPais);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Falha ao carregar os dados. Por favor, tente novamente mais tarde.');
      setEstados([]);
      setEstadosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };  // Função para aplicar filtros na lista de estados
  const aplicarFiltros = (data, filtroSit, filtroPaisId) => {
    if (!data || !Array.isArray(data)) {
      setEstadosFiltrados([]);
      return;
    }    
    let resultado = [...data];// Filtro por situação - simplificamos para usar Boolean()
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(estado => Boolean(estado.situacao));
        break;
        
      case 'inativos':
        resultado = resultado.filter(estado => !Boolean(estado.situacao));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar
    }
    
    // Filtro adicional por país
    if (filtroPaisId) {
      resultado = resultado.filter(estado => String(estado.paisId) === String(filtroPaisId));
    }
    
    // Ordenar por nome para melhor apresentação
    resultado = resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    setEstadosFiltrados(resultado);
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchData();
    
    // Adicionar um listener para atualizações de dados
    const handleDataChange = () => {
      fetchData();
    };
    
    // Registrar o ouvinte para o evento dataChange
    window.addEventListener('dataChange', handleDataChange);
    
    // Cleanup: remover o ouvinte quando o componente for desmontado
    return () => {
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, []);
  
  // Aplicar filtros quando os filtros ou os dados mudarem
  useEffect(() => {
    aplicarFiltros(estados, filtroSituacao, filtroPais);
  }, [filtroSituacao, filtroPais, estados]);
  
  // Manipulador para mudança de filtro de situação
  const handleFiltroSituacaoChange = (e) => {
    setFiltroSituacao(e.target.value);
  };
  
  // Manipulador para mudança de filtro de país
  const handleFiltroPaisChange = (e) => {
    setFiltroPais(e.target.value);
  };
  const handleDelete = async (id) => {
    try {
      // Usa o estado armazenado na variável de estado para mostrar o nome em caso de erro
      const estadoNome = estadoParaExcluir?.nome;
      
      // Chamar o método delete do serviço
      await EstadoService.delete(id);
      
      // Fechar o modal e limpar o estado
      setModalOpen(false);
      setEstadoParaExcluir(null);
      
      // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Estado "${estadoNome}" excluído com sucesso!` });
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
      
      // Recarregar dados
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir estado:', error);
      
      let mensagemErro = "Não foi possível excluir o estado.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (error.response && error.response.data && 
          typeof error.response.data === 'string' &&
          error.response.data.includes('foreign key constraint fails')) {
        mensagemErro = `Não é possível excluir o estado "${estadoParaExcluir.nome}" porque existem cidades associadas a ele.`;
      }
      
      setModalOpen(false);
      setEstadoParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };

  const openDeleteModal = (estado) => {
    setEstadoParaExcluir(estado);
    setModalOpen(true);
  };

  if (loading) {
    return <div className="text-center my-5">Carregando...</div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Estados</h3>
          <Link to="/localizacao/estados/novo">
            <Button color="primary">
              {/* Substituir FaPlus por texto se não tiver react-icons */}
              + Novo Estado
            </Button>
          </Link>
        </div>        {error && (
          <Alert color={error.type === 'success' ? 'success' : 'danger'}>
            {error.message || error}
          </Alert>
        )}
          
        <div className="mb-3">
          <div style={{ maxWidth: '600px' }} className="d-flex flex-column flex-md-row gap-3">
            {/* Filtro por situação */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="filtroSituacao">Filtrar por situação:</Label>
              <Input 
                type="select" 
                id="filtroSituacao" 
                value={filtroSituacao}
                onChange={handleFiltroSituacaoChange}
                className="form-select mb-2"
              >
                <option value="ativos">Somente Ativos</option>
                <option value="inativos">Somente Inativos</option>
                <option value="todos">Todos</option>
              </Input>
            </div>
            
            {/* Filtro por país */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="filtroPais">Filtrar por país:</Label>
              <Input 
                type="select" 
                id="filtroPais" 
                value={filtroPais}
                onChange={handleFiltroPaisChange}
                className="form-select mb-2"
              >
                <option value="">Todos os países</option>
                {paises.map(pais => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>
          
          <div className="text-muted mt-1">
            Exibindo {estadosFiltrados.length} {estadosFiltrados.length === 1 ? 'estado' : 'estados'}
            {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
            {filtroPais ? ` no país selecionado` : ''}
          </div>
        </div>        <Table responsive striped>
          <thead>
            <tr>              <th>Estado</th>
              <th>UF</th>
              <th>País</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Última Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {estadosFiltrados.length > 0 ? (
              estadosFiltrados.map(estado => (
                <tr key={estado.id}>
                  <td>{estado.nome}</td>
                  <td>{estado.uf}</td>
                  <td>{estado.paisNome}</td>                  <td>
                    {Boolean(estado.situacao) ? (
                      <span className="badge rounded-pill px-3 py-2 bg-success">Ativo</span>
                    ) : (
                      <span className="badge rounded-pill px-3 py-2 bg-danger">Inativo</span>
                    )}
                  </td>                  <td>
                    {estado.dataCriacao ? moment(estado.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{estado.userCriacao || 'Sistema'}</small>
                  </td>
                  <td>
                    {estado.dataAlteracao ? moment(estado.dataAlteracao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    {estado.dataAlteracao && <small className="d-block text-muted">{estado.userAtualizacao || 'Sistema'}</small>}
                  </td>
                  <td>
                    <Link to={`/localizacao/estados/detalhes/${estado.id}`} className="btn btn-sm btn-primary me-2">
                      Detalhes
                    </Link>                    <Link to={`/localizacao/estados/editar/${estado.id}`} className="btn btn-sm btn-info me-2">
                      Editar
                    </Link>
                    {Boolean(estado.situacao) && (
                      <Button color="danger" size="sm" onClick={() => openDeleteModal(estado)}>
                        Excluir
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  {estados.length === 0 ? 
                    "Nenhum estado cadastrado." : 
                    `Nenhum estado ${filtroSituacao === 'ativos' ? 'ativo' : filtroSituacao === 'inativos' ? 'inativo' : ''} encontrado${filtroPais ? ' para o país selecionado' : ''}.`}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </CardBody>      <DeleteConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onDelete={() => handleDelete(estadoParaExcluir?.id)}
        itemName={estadoParaExcluir?.nome}
        itemType="estado"
      />
    </Card>
  );
};

export default EstadoList;