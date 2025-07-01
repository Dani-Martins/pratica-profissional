import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDataContext } from '../../contexts/DataContext';
import InactivateConfirmationModal from '../../components/InactivateConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FornecedorList = () => {  // Função auxiliar para formatar datas de forma segura e garantir exibição da hora corretamente
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Verificar se é um objeto Date
      if (data instanceof Date && !isNaN(data)) {
        return moment(data).format('DD/MM/YYYY HH:mm');
      }
      
      // Verificar se é uma string no formato ISO
      if (typeof data === 'string') {
        // Se contém T, tenta parsear como formato ISO
        if (data.includes('T')) {
          // Para garantir que a hora seja preservada corretamente
          const isoString = data.includes('Z') ? data : data.replace(' ', 'T');
          return moment(isoString).format('DD/MM/YYYY HH:mm');
        }
        
        // Se contém espaço, pode ser um formato como "YYYY-MM-DD HH:MM:SS"
        if (data.includes(' ') && data.includes(':')) {
          const [datePart, timePart] = data.split(' ');
          if (datePart && timePart) {
            return moment(`${datePart}T${timePart}`).format('DD/MM/YYYY HH:mm');
          }
        }
      }
      
      // Tentativa genérica com moment
      if (moment(data).isValid()) {
        return moment(data).format('DD/MM/YYYY HH:mm');
      }
      
      // Se chegou até aqui e não conseguiu formatar, tenta uma abordagem mais direta
      const dataObj = new Date(data);
      if (!isNaN(dataObj.getTime())) {
        return moment(dataObj).format('DD/MM/YYYY HH:mm');
      }
      
      console.log('Formato de data não reconhecido:', data);
      return 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'Erro';
    }
  };
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState(null);
  
  // Estados para filtros
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  const [filtroTipoPessoa, setFiltroTipoPessoa] = useState('todos'); // 'F', 'J', ou 'todos'
  
  const { apiClient } = useDataContext();
    useEffect(() => {
    console.log("baseURL do apiClient:", apiClient.defaults.baseURL);
    carregarFornecedores();
    
    // Adicionar listener para eventos de navegação e alterações de dados
    const handleDataChange = () => carregarFornecedores();
    window.addEventListener('focus', handleDataChange);
    window.addEventListener('dataChange', handleDataChange);
    
    return () => {
      window.removeEventListener('focus', handleDataChange);
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, []);

  // Aplicar filtros quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros(fornecedores, filtroSituacao, filtroTipoPessoa);
  }, [filtroSituacao, filtroTipoPessoa, fornecedores]);

  useEffect(() => {
    const mensagemSucesso = localStorage.getItem('fornecedor_sucesso');
    if (mensagemSucesso) {
      setError({ type: 'success', message: mensagemSucesso });
      localStorage.removeItem('fornecedor_sucesso');
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
    }
  }, []);
  // Função para aplicar filtros na lista de fornecedores
  const aplicarFiltros = (data, filtroSit, filtroTipo) => {
    if (!data || !Array.isArray(data)) {
      setFornecedoresFiltrados([]);
      return;
    }
    
    let resultado = [...data];
    
    // Filtro por situação
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(fornecedor => Boolean(fornecedor.ativo));
        break;
        
      case 'inativos':
        resultado = resultado.filter(fornecedor => !Boolean(fornecedor.ativo));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por situação
    }
    
    // Filtro por tipo de pessoa
    switch(filtroTipo) {
      case 'F':
        resultado = resultado.filter(fornecedor => fornecedor.tipoPessoa === 'F');
        break;
        
      case 'J':
        resultado = resultado.filter(fornecedor => fornecedor.tipoPessoa === 'J');
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por tipo de pessoa
    }
    
    // Ordenar os fornecedores
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
    console.log(`Resultado: ${resultado.length} fornecedores após filtros`);
    
    setFornecedoresFiltrados(resultado);
  };
  
  const carregarFornecedores = async () => {
    setLoading(true);
    try {      console.log("Tentando buscar fornecedores da API...");
      // Adicionando parâmetro expand para incluir a condição de pagamento
      const response = await apiClient.get('/Fornecedor?expand=condicaoPagamento');
      
      if (response.data && Array.isArray(response.data)) {
        // Adicionar logs para verificar os dados de data
        if (response.data.length > 0) {
          console.log("Exemplo de dados de fornecedor recebidos:");
          console.log("dataCriacao:", response.data[0].dataCriacao, "tipo:", typeof response.data[0].dataCriacao);
          console.log("dataAlteracao:", response.data[0].dataAlteracao, "tipo:", typeof response.data[0].dataAlteracao);
          console.log("userCriacao:", response.data[0].userCriacao);
          console.log("userAtualizacao:", response.data[0].userAtualizacao);
          
          // Verificar se a condição de pagamento está sendo recebida
          console.log("Condição de Pagamento:", response.data[0].condicaoPagamento);
          console.log("CondicaoPagamentoId:", response.data[0].condicaoPagamentoId);
          
          // Testar formatação de data
          console.log("Formatação da data de criação:", formatarData(response.data[0].dataCriacao));
          console.log("Formatação da data de alteração:", formatarData(response.data[0].dataAlteracao));
        }
        // Normalizar datas e garantir que outros dados estejam corretos
        const fornecedoresNormalizados = await Promise.all(response.data.map(async f => {
          // Garantir que as datas sejam objetos Date
          if (f.dataCriacao) {
            f.dataCriacao = new Date(f.dataCriacao);
          }
          if (f.dataAlteracao) {
            f.dataAlteracao = new Date(f.dataAlteracao);
          }
          
          // Verificar/normalizar a condição de pagamento
          if (f.condicaoPagamentoId && !f.condicaoPagamento) {
            console.log(`Fornecedor ${f.id} tem condicaoPagamentoId (${f.condicaoPagamentoId}) mas não tem objeto condicaoPagamento, tentando carregar...`);
            try {
              // Carregar dados da condição de pagamento
              const condicaoResponse = await apiClient.get(`/CondicaoPagamento/${f.condicaoPagamentoId}`);
              if (condicaoResponse.data) {
                f.condicaoPagamento = condicaoResponse.data;
                console.log(`Condição de pagamento carregada para fornecedor ${f.id}: ${f.condicaoPagamento.descricao}`);
              }
            } catch (err) {
              console.error(`Erro ao carregar condição de pagamento para fornecedor ${f.id}:`, err);
            }
          }
          
          return f;
        }));
        
        setFornecedores(fornecedoresNormalizados);
        // Aplicamos os filtros aqui inicialmente 
        aplicarFiltros(fornecedoresNormalizados, filtroSituacao, filtroTipoPessoa);
        setError(null);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError({ type: 'danger', message: "Formato de dados inválido recebido do servidor." });
      }
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
      setError({ type: 'danger', message: `Não foi possível carregar a lista de fornecedores: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };
  // Abrir modal de confirmação de exclusão
  const openDeleteModal = (fornecedor) => {
    setFornecedorParaExcluir(fornecedor);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      // Usa o estado armazenado na variável para mostrar o nome em caso de erro
      const fornecedorNome = fornecedorParaExcluir?.tipoPessoa === 'F' 
        ? fornecedorParaExcluir?.nome 
        : fornecedorParaExcluir?.razaoSocial || fornecedorParaExcluir?.nomeFantasia;
      
      // Chamar a API para inativar o fornecedor (não excluir fisicamente)
      await apiClient.delete(`/Fornecedor/${id}`);
      
      // Fechar o modal e limpar o estado
      setModalOpen(false);
      setFornecedorParaExcluir(null);
        // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Fornecedor "${fornecedorNome}" inativado com sucesso!` });
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
      
      // Recarregar dados
      carregarFornecedores();
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      
      let mensagemErro = "Não foi possível excluir o fornecedor.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (err.response && err.response.data && 
          typeof err.response.data === 'string' && 
          err.response.data.includes('foreign key constraint fails')) {
        const fornecedorNome = fornecedorParaExcluir?.tipoPessoa === 'F' 
          ? fornecedorParaExcluir?.nome 
          : fornecedorParaExcluir?.razaoSocial || fornecedorParaExcluir?.nomeFantasia;
        mensagemErro = `Não é possível excluir o fornecedor "${fornecedorNome}" porque existem registros associados a ele.`;
      } else {
        mensagemErro = err.response?.data?.mensagem || err.response?.data?.title || 'Erro ao excluir. Verifique se não há registros dependentes ou tente novamente.';
      }
      
      setModalOpen(false);
      setFornecedorParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };
  if (loading && !fornecedores.length) {
    return <div className="text-center my-5">Carregando...</div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Fornecedores</h3>
          <Link to="/fornecedores/novo">
            <Button color="primary">
              + Novo Fornecedor
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
            Exibindo {fornecedoresFiltrados.length} {fornecedoresFiltrados.length === 1 ? 'fornecedor' : 'fornecedores'}
            {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
            {filtroTipoPessoa !== 'todos' ? ` (${filtroTipoPessoa === 'F' ? 'somente pessoas físicas' : 'somente pessoas jurídicas'})` : ''}
          </div>
          
          {/* Debug para inspecionar os dados */}
          {fornecedoresFiltrados.length > 0 && (
            <div className="small text-muted mt-1" style={{ display: 'none' }}>
              <pre>
                {JSON.stringify(fornecedoresFiltrados[0], null, 2)}
              </pre>
            </div>
          )}
        </div>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Tipo</th>              <th>Fornecedor</th>
              <th>CPF/CNPJ</th>
              <th>Condição de Pagamento</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedoresFiltrados.length > 0 ? 
              fornecedoresFiltrados.map(fornecedor => {
                const nomeExibicao = fornecedor.tipoPessoa === 'F' 
                  ? (fornecedor.nome || '-') 
                  : (fornecedor.razaoSocial || fornecedor.nomeFantasia || '-');
                
                const documento = fornecedor.tipoPessoa === 'F' 
                  ? (fornecedor.cpf || '-') 
                  : (fornecedor.cnpj || '-');
                
                return (
                  <tr key={fornecedor.id}>
                    <td>
                      <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: fornecedor.tipoPessoa === 'F' ? '#17a2b8' : '#ffc107', color: fornecedor.tipoPessoa === 'F' ? 'white' : 'black' }}>
                        {fornecedor.tipoPessoa === 'F' ? 'PF' : 'PJ'}
                      </span>
                    </td>                    <td>{nomeExibicao}</td>
                    <td>{documento}</td>
                    <td>{(() => {
                      // Verificar diferentes formas possíveis de como a condição de pagamento pode vir
                      const descricao = fornecedor.condicaoPagamento?.descricao || 
                        fornecedor.CondicaoPagamento?.descricao || 
                        fornecedor.condicaoPagamento?.Descricao;
                      
                      if (descricao) {
                        return descricao;
                      } else if (fornecedor.condicaoPagamentoId) {
                        return `ID: ${fornecedor.condicaoPagamentoId}`;
                      } else {
                        return '-';
                      }
                    })()}</td>
                    <td>
                      {Boolean(fornecedor.ativo) ? 
                        <span className="badge rounded-pill px-3 py-2 bg-success">Ativo</span> : 
                        <span className="badge rounded-pill px-3 py-2 bg-danger">Inativo</span>}
                    </td><td>
                      {(fornecedor.dataCriacao || fornecedor.DataCriacao)
                        ? formatarData(fornecedor.dataCriacao || fornecedor.DataCriacao)
                        : 'N/A'}
                      <small className="d-block text-muted">{fornecedor.userCriacao || fornecedor.UserCriacao || 'Sistema'}</small>
                    </td><td>
                      {(fornecedor.dataAlteracao || fornecedor.DataAlteracao)
                        ? formatarData(fornecedor.dataAlteracao || fornecedor.DataAlteracao)
                        : '-'}
                      <small className="d-block text-muted">{fornecedor.userAtualizacao || fornecedor.UserAtualizacao || 'Sistema'}</small>
                    </td><td>
                      <div className="d-flex gap-1">
                        <Link to={`/fornecedores/detalhes/${fornecedor.id}`} className="btn btn-sm btn-primary">
                          Detalhes
                        </Link>
                        <Link to={`/fornecedores/editar/${fornecedor.id}`} className="btn btn-sm btn-info">
                          Editar
                        </Link>
                        
                        {Boolean(fornecedor.ativo) && (
                          <Button color="danger" size="sm" onClick={() => openDeleteModal(fornecedor)}>
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
              : 
              <tr>
                <td colSpan="10" className="text-center">
                  {fornecedores.length === 0 ? 
                    "Nenhum fornecedor cadastrado." : 
                    `Nenhum fornecedor ${filtroSituacao === 'ativos' ? 'ativo' : filtroSituacao === 'inativos' ? 'inativo' : ''} encontrado${filtroTipoPessoa !== 'todos' ? ` do tipo "${filtroTipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}"` : ''}.`}
                </td>
              </tr>
            }
          </tbody>
        </Table>
      </CardBody>        <InactivateConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onInactivate={() => handleDelete(fornecedorParaExcluir?.id)}
        itemName={fornecedorParaExcluir?.tipoPessoa === 'F' 
          ? (fornecedorParaExcluir?.nome || 'N/A') 
          : (fornecedorParaExcluir?.razaoSocial || fornecedorParaExcluir?.nomeFantasia || 'N/A')}
        itemType="fornecedor"
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o fornecedor "${fornecedorParaExcluir?.tipoPessoa === 'F' 
          ? (fornecedorParaExcluir?.nome || 'N/A') 
          : (fornecedorParaExcluir?.razaoSocial || fornecedorParaExcluir?.nomeFantasia || 'N/A')}"?`}
      />
    </Card>
  );
};

export default FornecedorList;
