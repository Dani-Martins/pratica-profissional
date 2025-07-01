import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDataContext } from '../../contexts/DataContext';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const ClienteList = () => {
  // Função auxiliar para formatar datas de forma segura
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Primeiro tenta diretamente com o moment
      if (moment(data).isValid()) {
        return moment(data).format('DD/MM/YYYY HH:mm');
      }
      
      // Depois tenta converter para Date primeiro
      const dataObj = new Date(data);
      if (!isNaN(dataObj.getTime())) {
        return moment(dataObj).format('DD/MM/YYYY HH:mm');
      }
      
      // Se ainda não conseguiu, verifica se é uma string no formato ISO
      if (typeof data === 'string' && data.includes('T')) {
        return moment(data.split('T')[0] + 'T' + data.split('T')[1].split('.')[0]).format('DD/MM/YYYY HH:mm');
      }
      
      return 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'Erro';
    }
  };

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  
  // Estados para filtros
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  const [filtroTipoPessoa, setFiltroTipoPessoa] = useState('todos'); // 'F', 'J', ou 'todos'
  
  const { apiClient } = useDataContext();  useEffect(() => {
    console.log("baseURL do apiClient:", apiClient.defaults.baseURL);
    carregarClientes();
    
    // Adicionar listener para eventos de navegação e alterações de dados
    const handleDataChange = () => carregarClientes();
    window.addEventListener('focus', handleDataChange);
    window.addEventListener('dataChange', handleDataChange);
    
    return () => {
      window.removeEventListener('focus', handleDataChange);
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, []);

  // Aplicar filtros quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros(clientes, filtroSituacao, filtroTipoPessoa);
  }, [filtroSituacao, filtroTipoPessoa, clientes]);

  useEffect(() => {
    const mensagemSucesso = localStorage.getItem('cliente_sucesso');
    if (mensagemSucesso) {
      setError({ type: 'success', message: mensagemSucesso });
      localStorage.removeItem('cliente_sucesso');
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
    }
  }, []);
  // Função para aplicar filtros na lista de clientes
  const aplicarFiltros = (data, filtroSit, filtroTipo) => {
    if (!data || !Array.isArray(data)) {
      setClientesFiltrados([]);
      return;
    }
    
    let resultado = [...data];
    
    // Filtro por situação
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(cliente => Boolean(cliente.ativo));
        break;
        
      case 'inativos':
        resultado = resultado.filter(cliente => !Boolean(cliente.ativo));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por situação
    }
    
    // Filtro por tipo de pessoa
    switch(filtroTipo) {
      case 'F':
        resultado = resultado.filter(cliente => cliente.tipoPessoa === 'F');
        break;
        
      case 'J':
        resultado = resultado.filter(cliente => cliente.tipoPessoa === 'J');
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por tipo de pessoa
    }
    
    // Ordenar os clientes
    resultado = resultado.sort((a, b) => {
      // Primeiro ordena por tipo (F primeiro, depois J)
      if (a.tipoPessoa !== b.tipoPessoa) {
        return a.tipoPessoa === 'F' ? -1 : 1;
      }
      // Depois ordena por nome/razão social
      const nomeA = a.tipoPessoa === 'F' ? (a.nome || '') : (a.razaoSocial || a.nomeFantasia || '');
      const nomeB = b.tipoPessoa === 'F' ? (b.nome || '') : (b.razaoSocial || b.nomeFantasia || '');
      return nomeA.localeCompare(nomeB);
    });
    
    console.log(`Aplicando filtros: Situação=${filtroSit}, Tipo=${filtroTipo}`);
    console.log(`Resultado: ${resultado.length} clientes após filtros`);
    
    setClientesFiltrados(resultado);
  };

  const carregarClientes = async () => {
    setLoading(true);
    try {
      console.log("Tentando buscar clientes da API...");
      const response = await apiClient.get('/Cliente');
      console.log("Resposta da API:", response);
      
      if (response.data && Array.isArray(response.data)) {
        // Adicionar logs para verificar os dados de data
        if (response.data.length > 0) {
          console.log("Exemplo de dados de cliente recebidos:");
          console.log("dataCriacao:", response.data[0].dataCriacao, "tipo:", typeof response.data[0].dataCriacao);
          console.log("dataAlteracao:", response.data[0].dataAlteracao, "tipo:", typeof response.data[0].dataAlteracao);
          console.log("userCriacao:", response.data[0].userCriacao);
          console.log("userAtualizacao:", response.data[0].userAtualizacao);
        }
        
        setClientes(response.data);
        // Aplicamos os filtros aqui inicialmente 
        aplicarFiltros(response.data, filtroSituacao, filtroTipoPessoa);
        setError(null);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError({ type: 'danger', message: "Formato de dados inválido recebido do servidor." });
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError({ type: 'danger', message: `Não foi possível carregar a lista de clientes: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };  const openDeleteModal = (cliente) => {
    setClienteParaExcluir(cliente);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      // Usa o estado armazenado na variável para mostrar o nome em caso de erro
      const clienteNome = clienteParaExcluir?.tipoPessoa === 'F' 
        ? clienteParaExcluir?.nome 
        : clienteParaExcluir?.razaoSocial || clienteParaExcluir?.nomeFantasia;
      
      // Chamar a API para excluir o cliente
      await apiClient.delete(`/Cliente/${id}`);
      
      // Fechar o modal e limpar o estado
      setModalOpen(false);
      setClienteParaExcluir(null);
      
      // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Cliente "${clienteNome}" excluído com sucesso!` });
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
      
      // Recarregar dados
      carregarClientes();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      
      let mensagemErro = "Não foi possível excluir o cliente.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (err.response && err.response.data && 
          typeof err.response.data === 'string' && 
          err.response.data.includes('foreign key constraint fails')) {
        const clienteNome = clienteParaExcluir?.tipoPessoa === 'F' 
          ? clienteParaExcluir?.nome 
          : clienteParaExcluir?.razaoSocial || clienteParaExcluir?.nomeFantasia;
        mensagemErro = `Não é possível excluir o cliente "${clienteNome}" porque existem registros associados a ele.`;
      } else {
        mensagemErro = err.response?.data?.mensagem || err.response?.data?.title || 'Erro ao excluir. Verifique se não há registros dependentes ou tente novamente.';
      }
      
      setModalOpen(false);
      setClienteParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };
  if (loading && !clientes.length) {
    return <div className="text-center my-5">Carregando...</div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Clientes</h3>
          <Link to="/clientes/novo">
            <Button color="primary">
              + Novo Cliente
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
                <option value="ativos">Somente ativos</option>
                <option value="inativos">Somente inativos</option>
                <option value="todos">Todos</option>
              </Input>
            </div>
            
            {/* Filtro por tipo de pessoa */}
            <div style={{ maxWidth: '350px', width: '100%' }}>
              <Label for="filtroTipoPessoa">Filtrar por tipo de pessoa:</Label>
              <Input 
                type="select" 
                id="filtroTipoPessoa"
                value={filtroTipoPessoa}
                onChange={e => setFiltroTipoPessoa(e.target.value)}
                className="form-select mb-2"
              >
                <option value="todos">Todos os tipos</option>
                <option value="F">Pessoa Física</option>
                <option value="J">Pessoa Jurídica</option>
              </Input>
            </div>
          </div>
              <div className="text-muted mt-1">
            Exibindo {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
            {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
            {filtroTipoPessoa !== 'todos' ? ` (${filtroTipoPessoa === 'F' ? 'somente pessoas físicas' : 'somente pessoas jurídicas'})` : ''}
          </div>
          
          {/* Debug para inspecionar os dados */}
          {clientesFiltrados.length > 0 && (
            <div className="small text-muted mt-1" style={{ display: 'none' }}>
              <pre>
                {JSON.stringify(clientesFiltrados[0], null, 2)}
              </pre>
            </div>
          )}
        </div><Table responsive striped>          <thead>
            <tr>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>Condição de Pagamento</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? 
              clientesFiltrados.map(cliente => {
                const nomeExibicao = cliente.tipoPessoa === 'F' 
                  ? (cliente.nome || '-') 
                  : (cliente.razaoSocial || cliente.nomeFantasia || '-');
                
                const documento = cliente.tipoPessoa === 'F' 
                  ? (cliente.cpf || '-') 
                  : (cliente.cnpj || '-');
                
                return (
                  <tr key={cliente.id}>
                    <td>
                      <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: cliente.tipoPessoa === 'F' ? '#17a2b8' : '#ffc107', color: cliente.tipoPessoa === 'F' ? 'white' : 'black' }}>
                        {cliente.tipoPessoa === 'F' ? 'PF' : 'PJ'}
                      </span>
                    </td>                    <td>{nomeExibicao}</td>
                    <td>{documento}</td>
                    <td>{cliente.telefone || '-'}</td>
                    <td>{cliente.condicaoPagamento?.descricao || '-'}</td>
                    <td>
                      {Boolean(cliente.ativo) ? 
                        <span className="badge rounded-pill bg-success" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Ativo
                        </span>
                        :
                        <span className="badge rounded-pill bg-danger" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inativo
                        </span>
                      }
                    </td>
                    <td>
                      {(cliente.dataCriacao || cliente.DataCriacao)
                        ? formatarData(cliente.dataCriacao || cliente.DataCriacao)
                        : 'N/A'}
                      <small className="d-block text-muted">{cliente.userCriacao || cliente.UserCriacao || 'Sistema'}</small>
                    </td>
                    <td>
                      {(cliente.dataAlteracao || cliente.DataAlteracao)
                        ? <>
                            {formatarData(cliente.dataAlteracao || cliente.DataAlteracao)}
                            <small className="d-block text-muted">{cliente.userAtualizacao || cliente.UserAtualizacao || 'Sistema'}</small>
                          </>
                        : <span className="text-muted">-</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/clientes/detalhes/${cliente.id}`} className="btn btn-sm btn-primary">
                          Detalhes
                        </Link>
                        <Link to={`/clientes/editar/${cliente.id}`} className="btn btn-sm btn-info">
                          Editar
                        </Link>
                        
                        {Boolean(cliente.ativo) && (
                          <Button color="danger" size="sm" onClick={() => openDeleteModal(cliente)}>
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
              : 
              <tr>                <td colSpan="8" className="text-center">
                  {clientes.length === 0 ? 
                    "Nenhum cliente cadastrado." : 
                    `Nenhum cliente ${filtroSituacao === 'ativos' ? 'ativo' : filtroSituacao === 'inativos' ? 'inativo' : ''} encontrado${filtroTipoPessoa !== 'todos' ? ` do tipo "${filtroTipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}"` : ''}.`}
                </td>
              </tr>
            }
          </tbody>
        </Table>      </CardBody>
      
      <DeleteConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onDelete={() => handleDelete(clienteParaExcluir?.id)}
        itemName={clienteParaExcluir?.tipoPessoa === 'F' 
          ? (clienteParaExcluir?.nome || 'N/A') 
          : (clienteParaExcluir?.razaoSocial || clienteParaExcluir?.nomeFantasia || 'N/A')}
        itemType="cliente"
      />
    </Card>
  );
};

export default ClienteList;