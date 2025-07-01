import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDataContext } from '../../../contexts/DataContext';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FuncaoFuncionarioList = () => {
  // Função auxiliar para formatar datas de forma segura
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Primeiro tenta diretamente com o moment
      if (moment(data).isValid()) {
        return moment(data).format('DD/MM/YYYY HH:mm:ss');
      }
      
      // Depois tenta converter para Date primeiro
      const dataObj = new Date(data);
      if (!isNaN(dataObj.getTime())) {
        return moment(dataObj).format('DD/MM/YYYY HH:mm:ss');
      }
      
      // Se ainda não conseguiu, verifica se é uma string no formato ISO
      if (typeof data === 'string' && data.includes('T')) {
        return moment(data.split('T')[0] + 'T' + data.split('T')[1].split('.')[0]).format('DD/MM/YYYY HH:mm:ss');
      }
      
      return 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'Erro';
    }
  };

  const [funcoes, setFuncoes] = useState([]);
  const [funcoesFiltradas, setFuncoesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [funcaoParaExcluir, setFuncaoParaExcluir] = useState(null);
  
  // Estados para filtros
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  
  const { apiClient } = useDataContext();  
  
  useEffect(() => {
    console.log("baseURL do apiClient:", apiClient.defaults.baseURL);
    carregarFuncoes();
    
    // Adicionar listener para eventos de navegação e alterações de dados
    const handleDataChange = () => carregarFuncoes();
    window.addEventListener('focus', handleDataChange);
    window.addEventListener('dataChange', handleDataChange);
    
    return () => {
      window.removeEventListener('focus', handleDataChange);
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, []);

  // Aplicar filtros quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros(funcoes, filtroSituacao);
  }, [filtroSituacao, funcoes]);

  // Função para aplicar filtros na lista de funções
  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setFuncoesFiltradas([]);
      return;
    }
    
    let resultado = [...data];
    
    // Filtro por situação
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(funcao => Boolean(funcao.ativo));
        break;
        
      case 'inativos':
        resultado = resultado.filter(funcao => !Boolean(funcao.ativo));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por situação
    }
      // Ordenar as funções pelo nome da função
    resultado = resultado.sort((a, b) => {
      const nomeA = a.funcaoFuncionarioNome || a.funcaofuncionario || a.descricao || '';
      const nomeB = b.funcaoFuncionarioNome || b.funcaofuncionario || b.descricao || '';
      return nomeA.localeCompare(nomeB);
    });
    
    console.log(`Aplicando filtros: Situação=${filtroSit}`);
    console.log(`Resultado: ${resultado.length} funções após filtros`);
    
    setFuncoesFiltradas(resultado);
  };

  const carregarFuncoes = async () => {
    setLoading(true);
    try {
      console.log("Tentando buscar funções de funcionários da API...");
      const response = await apiClient.get('/FuncaoFuncionario');
      console.log("Resposta da API:", response);
      
      if (response.data && Array.isArray(response.data)) {
        // Adicionar logs para verificar os dados de data
        if (response.data.length > 0) {
          console.log("Exemplo de dados de função recebidos:");
          console.log("dataCriacao:", response.data[0].dataCriacao, "tipo:", typeof response.data[0].dataCriacao);
          console.log("dataAlteracao:", response.data[0].dataAlteracao, "tipo:", typeof response.data[0].dataAlteracao);
          console.log("userCriacao:", response.data[0].userCriacao);
          console.log("userAtualizacao:", response.data[0].userAtualizacao);
        }
        
        setFuncoes(response.data);
        // Aplicamos os filtros aqui inicialmente 
        aplicarFiltros(response.data, filtroSituacao);
        setError(null);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError({ type: 'danger', message: "Formato de dados inválido recebido do servidor." });
      }
    } catch (err) {
      console.error('Erro ao carregar funções de funcionários:', err);
      setError({ type: 'danger', message: `Não foi possível carregar a lista de funções de funcionários: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };  
  
  const openDeleteModal = (funcao) => {
    setFuncaoParaExcluir(funcao);
    setModalOpen(true);
  };
  const handleDelete = async (id) => {
    try {
      // Usa o estado armazenado na variável para mostrar o nome em caso de erro
      const nomeFuncao = funcaoParaExcluir?.funcaoFuncionarioNome || funcaoParaExcluir?.funcaofuncionario || funcaoParaExcluir?.descricao;
      
      // Chamar a API para excluir a função
      await apiClient.delete(`/FuncaoFuncionario/${id}`);
      
      // Fechar o modal e limpar o estado
      setModalOpen(false);
      setFuncaoParaExcluir(null);
      
      // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Função "${nomeFuncao}" excluída com sucesso!` });
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
      
      // Recarregar dados
      carregarFuncoes();
    } catch (err) {
      console.error('Erro ao excluir função de funcionário:', err);
      
      let mensagemErro = "Não foi possível excluir a função de funcionário.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (err.response && err.response.data && 
          typeof err.response.data === 'string' && 
          err.response.data.includes('foreign key constraint fails')) {
        const nomeFuncao = funcaoParaExcluir?.funcaoFuncionarioNome || funcaoParaExcluir?.funcaofuncionario || funcaoParaExcluir?.descricao;
        mensagemErro = `Não é possível excluir a função "${nomeFuncao}" porque existem registros associados a ela.`;
      } else {
        mensagemErro = err.response?.data?.mensagem || err.response?.data?.title || 'Erro ao excluir. Verifique se não há registros dependentes ou tente novamente.';
      }
      
      setModalOpen(false);
      setFuncaoParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };

  if (loading && !funcoes.length) {
    return <div className="text-center my-5">Carregando...</div>;
  }

  return (
    <Card>
      <CardBody>        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Funções de Funcionários</h3>
          <Link to="/funcionarios/funcoes/nova">
            <Button color="primary">
              + Nova Função
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
          </div>
          <div className="text-muted mt-1">
            Exibindo {funcoesFiltradas.length} {funcoesFiltradas.length === 1 ? 'função' : 'funções'}
            {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
          </div>
          
          {/* Debug para inspecionar os dados */}
          {funcoesFiltradas.length > 0 && (
            <div className="small text-muted mt-1" style={{ display: 'none' }}>
              <pre>
                {JSON.stringify(funcoesFiltradas[0], null, 2)}
              </pre>
            </div>
          )}
        </div>        <Table responsive striped>          
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Função do Funcionário</th>
              <th style={{ width: '15%' }}>Situação</th>
              <th style={{ width: '20%' }}>Data Criação</th>
              <th style={{ width: '20%' }}>Última Atualização</th>
              <th style={{ width: '15%' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcoesFiltradas.length > 0 ? 
              funcoesFiltradas.map(funcao => {
                return (                  <tr key={funcao.id}>
                    <td className="fw-semibold">{funcao.funcaoFuncionarioNome || funcao.funcaofuncionario || funcao.descricao || '-'}</td>
                    <td>
                      {Boolean(funcao.ativo) ? 
                        <span className="badge rounded-pill px-3 py-2 bg-success">Ativo</span> : 
                        <span className="badge rounded-pill px-3 py-2 bg-danger">Inativo</span>}
                    </td>
                    <td>
                      {(funcao.dataCriacao || funcao.DataCriacao)
                        ? formatarData(funcao.dataCriacao || funcao.DataCriacao)
                        : 'N/A'}
                      <small className="d-block text-muted">{funcao.userCriacao || funcao.UserCriacao || 'Sistema'}</small>
                    </td>
                    <td>
                      {(funcao.dataAlteracao || funcao.DataAlteracao)
                        ? formatarData(funcao.dataAlteracao || funcao.DataAlteracao)
                        : 'N/A'}
                      {(funcao.dataAlteracao || funcao.DataAlteracao) && 
                        <small className="d-block text-muted">
                          {funcao.userAtualizacao || funcao.UserAtualizacao || 'Sistema'}
                        </small>
                      }
                    </td>                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Link to={`/funcionarios/funcoes/detalhes/${funcao.id}`} className="btn btn-sm btn-primary mb-1">
                          Detalhes
                        </Link>
                        <Link to={`/funcionarios/funcoes/editar/${funcao.id}`} className="btn btn-sm btn-info mb-1">
                          Editar
                        </Link>
                        
                        {Boolean(funcao.ativo) && (
                          <Button color="danger" size="sm" onClick={() => openDeleteModal(funcao)} className="mb-1">
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
                <td colSpan="5" className="text-center">
                  {funcoes.length === 0 ? 
                    "Nenhuma função de funcionário cadastrada." : 
                    `Nenhuma função ${filtroSituacao === 'ativos' ? 'ativa' : filtroSituacao === 'inativos' ? 'inativa' : ''} encontrada.`}
                </td>
              </tr>
            }
          </tbody>
        </Table>
      </CardBody>
        <DeleteConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onDelete={() => handleDelete(funcaoParaExcluir?.id)}
        itemName={funcaoParaExcluir?.funcaoFuncionarioNome || funcaoParaExcluir?.funcaofuncionario || funcaoParaExcluir?.descricao || 'N/A'}
        itemType="função"
      />
    </Card>
  );
};

export default FuncaoFuncionarioList;
