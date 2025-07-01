import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, Button, Table, Spinner, Alert, Badge, Row, Col, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import '../Localizacao/Cidade/cidade-search-icon.css';

const FuncionarioList = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  
  // Estados para filtros
  const [filtroSituacao, setFiltroSituacao] = useState('ativos'); // Default: mostrar apenas ativos
  
  const navigate = useNavigate();
  
  // Função auxiliar para exibir o nome do funcionário
  const getFuncionarioDisplay = (funcionario) => {
    if (!funcionario) return '-';
    return funcionario.nome || '-';
  };

  // Função auxiliar para exibir CPF
  const getDocumentoDisplay = (funcionario) => {
    if (!funcionario) return '-';
    return funcionario.cpf ? `CPF: ${formatarCPF(funcionario.cpf)}` : '-';
  };
  
  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return '-';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);
  
  // Aplicar filtros quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros(funcionarios, filtroSituacao);
  }, [filtroSituacao, funcionarios]);
  
  // Função para aplicar filtros na lista de funcionários
  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setFuncionariosFiltrados([]);
      return;
    }
    
    let resultado = [...data];
    
    // Filtro por situação
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(funcionario => Boolean(funcionario.ativo));
        break;
        
      case 'inativos':
        resultado = resultado.filter(funcionario => !Boolean(funcionario.ativo));
        break;
        
      case 'todos':
      default:
        break; // Não filtrar por situação
    }
    
    // Ordenar os funcionários por nome
    resultado = resultado.sort((a, b) => {
      const nomeA = a.nome || '';
      const nomeB = b.nome || '';
      return nomeA.localeCompare(nomeB);
    });
    
    console.log(`Aplicando filtros: Situação=${filtroSit}`);
    console.log(`Resultado: ${resultado.length} funcionários após filtros`);
    
    setFuncionariosFiltrados(resultado);
  };
  
  const carregarFuncionarios = async () => {
    setLoading(true);
    try {
      console.log('Carregando funcionários');
      
      const response = await axios.get('/api/Funcionario', {
        params: {
          incluirInativos: true
        }
      });
      
      console.log("Dados originais dos funcionários:", response.data);
      
      // Garantir que os dados dos funcionários estão completos
      const funcionariosComCidades = await Promise.all(
        response.data.map(async (funcionario) => {
          // Carregar informações da cidade se disponível
          if (funcionario.cidadeId) {
            try {
              const cidadeResponse = await axios.get(`/api/Cidade/${funcionario.cidadeId}`);
              return {
                ...funcionario,
                cidade: cidadeResponse.data
              };
            } catch (cidadeErr) {
              console.error(`Erro ao carregar cidade para funcionário ${funcionario.id}:`, cidadeErr);
              return funcionario;
            }
          }
          
          return funcionario;
        })
      );
      
      setFuncionarios(funcionariosComCidades);
      aplicarFiltros(funcionariosComCidades, filtroSituacao);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setError({ type: 'danger', message: 'Não foi possível carregar a lista de funcionários. Tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    
    try {
      const dataObj = new Date(data);
      if (!isNaN(dataObj.getTime())) {
        return dataObj.toLocaleDateString('pt-BR') + ' ' + 
               dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      
      // Se é uma string no formato ISO
      if (typeof data === 'string' && data.includes('T')) {
        const [dataParte, horaParte] = data.split('T');
        const hora = horaParte.split('.')[0].substring(0, 5);
        const dataFormatada = new Date(dataParte).toLocaleDateString('pt-BR');
        return `${dataFormatada} ${hora}`;
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return '-';
    }
  };
  
  const confirmarExclusao = (funcionario) => {
    setFuncionarioParaExcluir(funcionario);
    setModalExclusao(true);
  };

  const excluirFuncionario = async () => {
    try {
      await axios.delete(`/api/Funcionario/${funcionarioParaExcluir.id}`);
      
      // Fechar o modal e limpar o estado
      setModalExclusao(false);
      
      // Mostrar mensagem de sucesso
      setError({ type: 'success', message: `Funcionário "${funcionarioParaExcluir.nome}" excluído com sucesso!` });
      
      // Limpar o funcionário para exclusão
      setFuncionarioParaExcluir(null);
      
      // Recarregar dados
      carregarFuncionarios();
      
      // Limpar a mensagem após alguns segundos
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
      
      let mensagemErro = "Não foi possível excluir o funcionário.";
      
      // Verificar se é erro de restrição de chave estrangeira
      if (err.response && err.response.data && 
          typeof err.response.data === 'string' && 
          err.response.data.includes('foreign key constraint fails')) {
        mensagemErro = `Não é possível excluir o funcionário "${funcionarioParaExcluir.nome}" porque existem registros associados a ele.`;
      } else {
        mensagemErro = err.response?.data?.mensagem || err.response?.data?.title || 'Erro ao excluir. Verifique se não há registros dependentes ou tente novamente.';
      }
      
      setModalExclusao(false);
      setFuncionarioParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };

  if (loading && funcionarios.length === 0) {
    return (
      <Container className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <Card className="border-0">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Funcionários</h4>
            <Button color="primary" onClick={() => {
              console.log("Navegando para cadastro de novo funcionário");
              navigate('/funcionarios/novo');
            }}>
              + Novo funcionário
            </Button>
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
            </div>
            
            <div className="text-muted mt-1">
              Exibindo {funcionariosFiltrados.length} {funcionariosFiltrados.length === 1 ? 'funcionário' : 'funcionários'}
              {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativos' : 'somente inativos'})` : ''}
            </div>
          </div>
          
          <div className="table-responsive">
            <Table striped hover className="w-100">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>CPF</th>
                  <th>Função</th>
                  <th>Telefone</th>
                  <th>Data admissão</th>
                  <th>Situação</th>
                  <th>Data Criação</th>
                  <th>Data Atualização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      {funcionarios.length === 0 ? 
                        "Nenhum funcionário cadastrado." : 
                        `Nenhum funcionário ${filtroSituacao === 'ativos' ? 'ativo' : filtroSituacao === 'inativos' ? 'inativo' : ''} encontrado.`}
                    </td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map(funcionario => (
                    <tr key={funcionario.id}>
                      <td>{getFuncionarioDisplay(funcionario)}</td>
                      <td>{getDocumentoDisplay(funcionario)}</td>
                      <td>{funcionario.funcaoFuncionario?.funcaoFuncionarioNome || '-'}</td>
                      <td>{funcionario.telefone || '-'}</td>
                      <td>{funcionario.dataAdmissao ? new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR') : '-'}</td>
                      <td>
                        {funcionario.ativo ? (
                          <span className="badge rounded-pill px-3 py-2 bg-success">Ativo</span>
                        ) : (
                          <span className="badge rounded-pill px-3 py-2 bg-danger">Inativo</span>
                        )}
                      </td>
                      <td>
                        {(funcionario.dataCriacao)
                          ? formatarData(funcionario.dataCriacao)
                          : 'N/A'}
                        <small className="d-block text-muted">{funcionario.userCriacao || 'Sistema'}</small>
                      </td>
                      <td>
                        {(funcionario.dataAlteracao)
                          ? formatarData(funcionario.dataAlteracao)
                          : '-'}
                        <small className="d-block text-muted">{funcionario.userAtualizacao || 'Sistema'}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => navigate(`/funcionarios/detalhes/${funcionario.id}`)}
                            className="me-1"
                          >
                            Detalhes
                          </Button>
                          <Button 
                            color="info" 
                            size="sm" 
                            onClick={() => navigate(`/funcionarios/editar/${funcionario.id}`)}
                            className="me-1"
                          >
                            Editar
                          </Button>
                          {Boolean(funcionario.ativo) && (
                            <Button 
                              color="danger" 
                              size="sm"
                              onClick={() => confirmarExclusao(funcionario)}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
      
      <DeleteConfirmationModal
        isOpen={modalExclusao}
        toggle={() => setModalExclusao(!modalExclusao)}
        onDelete={() => excluirFuncionario()}
        itemName={funcionarioParaExcluir ? funcionarioParaExcluir.nome : ''}
        itemType="funcionário"
      />
    </Container>
  );
};

export default FuncionarioList;
