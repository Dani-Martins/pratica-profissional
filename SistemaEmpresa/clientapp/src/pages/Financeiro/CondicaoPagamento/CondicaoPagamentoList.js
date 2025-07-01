import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Spinner, Alert, Badge, Label, Input, Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const CondicaoPagamentoList = () => {
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [condicoesFiltradas, setCondicoesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [condicaoParaExcluir, setCondicaoParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos');
  const navigate = useNavigate();

  useEffect(() => {
    carregarCondicoesPagamento();
  }, []);

  useEffect(() => {
    aplicarFiltros(condicoesPagamento, filtroSituacao);
  }, [filtroSituacao, condicoesPagamento]);

  const carregarCondicoesPagamento = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/CondicaoPagamento');
      setCondicoesPagamento(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar a lista de condições de pagamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setCondicoesFiltradas([]);
      return;
    }
    let resultado = [...data];
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(f => Boolean(f.ativo));
        break;
      case 'inativos':
        resultado = resultado.filter(f => !Boolean(f.ativo));
        break;
      case 'todos':
      default:
        break;
    }
    setCondicoesFiltradas(resultado);
  };

  const confirmarExclusao = (condicao) => {
    setCondicaoParaExcluir(condicao);
    setModalExclusao(true);
  };

  const cancelarExclusao = () => {
    setModalExclusao(false);
    setCondicaoParaExcluir(null);
  };

  const inativarCondicaoPagamento = async () => {
    if (!condicaoParaExcluir) return;
    try {
      await axios.put(`/api/CondicaoPagamento/${condicaoParaExcluir.id}`, {
        ...condicaoParaExcluir,
        ativo: false
      });
      setModalExclusao(false);
      setCondicaoParaExcluir(null);
      setError({ type: 'success', message: 'Condição de pagamento inativada com sucesso!' });
      setTimeout(() => setError(null), 3000);
      carregarCondicoesPagamento();
    } catch (err) {
      let mensagemErro = 'Não foi possível inativar a condição de pagamento.';
      if (err.response?.data?.mensagem) {
        mensagemErro = err.response.data.mensagem;
      }
      setModalExclusao(false);
      setCondicaoParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };

  if (loading && condicoesPagamento.length === 0) {
    return (
      <Container className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Card className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Condições de Pagamento</h2>
          <Button color="primary" onClick={() => navigate('/financeiro/condicoes-pagamento/novo')}>
            + Nova Condição
          </Button>
        </div>

        {/* Filtro por situação */}
        <div className="mb-3" style={{ maxWidth: '350px' }}>
          <Label for="filtroSituacao">Filtrar por situação:</Label>
          <Input
            type="select"
            id="filtroSituacao"
            value={filtroSituacao}
            onChange={e => setFiltroSituacao(e.target.value)}
            className="form-select mb-2"
          >
            <option value="ativos">Somente ativas</option>
            <option value="inativos">Somente inativas</option>
            <option value="todos">Todas</option>
          </Input>
        </div>

        <div className="text-muted mt-1">
          Exibindo {condicoesFiltradas.length} {condicoesFiltradas.length === 1 ? 'condição de pagamento' : 'condições de pagamento'}
          {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativas' : 'somente inativas'})` : ''}
        </div>

        {error && <Alert color={error.type === 'danger' ? 'danger' : 'success'}>{error.message}</Alert>}

        <Table responsive striped>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>À Vista</th>
              <th>Juros (%)</th>
              <th>Multa (%)</th>
              <th>Desconto (%)</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {condicoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">Nenhuma condição de pagamento cadastrada.</td>
              </tr>
            ) : (
              condicoesFiltradas.map(condicao => (
                <tr key={condicao.id}>
                  <td>{condicao.codigo}</td>
                  <td>{condicao.descricao}</td>
                  <td>{condicao.aVista ? 'Sim' : 'Não'}</td>
                  <td>{condicao.percentualJuros}%</td>
                  <td>{condicao.percentualMulta}%</td>
                  <td>{condicao.percentualDesconto}%</td>
                  <td>
                    {condicao.ativo ? (
                      <span className="badge rounded-pill bg-success" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Ativo
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-danger" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inativo
                      </span>
                    )}
                  </td>
                  <td>
                    {condicao.data_cadastro || condicao.dataCriacao ? new Date(condicao.data_cadastro || condicao.dataCriacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    <small className="d-block text-muted">{condicao.userCriacao || 'Sistema'}</small>
                    {condicao.dataAlteracao && (
                      <>
                        <br/>
                        <span className="text-muted">Atualizado em: {new Date(condicao.dataAlteracao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <small className="d-block text-muted">{condicao.userAtualizacao || 'Sistema'}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/financeiro/condicoes-pagamento/detalhes/${condicao.id}`)}
                      >
                        Detalhes
                      </Button>
                      <Button
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/financeiro/condicoes-pagamento/editar/${condicao.id}`)}
                      >
                        Editar
                      </Button>
                      {condicao.ativo && (
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => confirmarExclusao(condicao)}
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
      </Card>

      <DeleteConfirmationModal
        isOpen={modalExclusao}
        toggle={cancelarExclusao}
        onDelete={inativarCondicaoPagamento}
        title="Confirmar Exclusão"
        itemName={condicaoParaExcluir?.codigo}
        itemType="a condição de pagamento"
      />
    </Container>
  );
};

export default CondicaoPagamentoList;