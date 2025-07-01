import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Spinner, Alert, Badge, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../../contexts/DataContext';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FormaPagamentoList = () => {
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [formasFiltradas, setFormasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formaPagamentoParaExcluir, setFormaPagamentoParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos');
  const { apiClient } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    carregarFormasPagamento();
  }, []);

  useEffect(() => {
    aplicarFiltros(formasPagamento, filtroSituacao);
  }, [filtroSituacao, formasPagamento]);

  const carregarFormasPagamento = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/FormaPagamento');
      setFormasPagamento(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar a lista de formas de pagamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setFormasFiltradas([]);
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
    setFormasFiltradas(resultado);
  };

  const openDeleteModal = (forma) => {
    setFormaPagamentoParaExcluir(forma);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/FormaPagamento/${id}`);
      setModalOpen(false);
      setFormaPagamentoParaExcluir(null);
      setError({ type: 'success', message: 'Forma de pagamento inativada com sucesso!' });
      setTimeout(() => setError(null), 3000);
      carregarFormasPagamento();
    } catch (err) {
      let mensagemErro = 'Não foi possível inativar a forma de pagamento.';
      if (err.response?.data?.mensagem) {
        mensagemErro = err.response.data.mensagem;
      }
      setModalOpen(false);
      setFormaPagamentoParaExcluir(null);
      setError({ type: 'danger', message: mensagemErro });
    }
  };

  if (loading && !formasPagamento.length) {
    return <div className="text-center my-5"><Spinner color="primary" /></div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Formas de Pagamento</h3>
          <Button color="primary" onClick={() => navigate('/financeiro/formas-pagamento/novo')}>
            + Nova Forma de Pagamento
          </Button>
        </div>

        {error && (
          <Alert color={error.type === 'success' ? 'success' : 'danger'} fade={false}>
            {error.message || error}
          </Alert>
        )}

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
          Exibindo {formasFiltradas.length} {formasFiltradas.length === 1 ? 'forma de pagamento' : 'formas de pagamento'}
          {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativas' : 'somente inativas'})` : ''}
        </div>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {formasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">Nenhuma forma de pagamento encontrada.</td>
              </tr>
            ) : (
              formasFiltradas.map(forma => (
                <tr key={forma.id}>
                  <td>{forma.descricao}</td>
                  <td>
                    {Boolean(forma.ativo) ? (
                      <span className="badge rounded-pill bg-success" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Ativa
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-danger" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inativa
                      </span>
                    )}
                  </td>
                  <td>
                    {forma.dataCriacao ? moment(forma.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{forma.userCriacao || 'Sistema'}</small>
                    {forma.dataAlteracao && (
                      <>
                        <br/>
                        <span className="text-muted">Atualizado em: {moment(forma.dataAlteracao).format('DD/MM/YYYY HH:mm')}</span>
                        <small className="d-block text-muted">{forma.userAtualizacao || 'Sistema'}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/financeiro/formas-pagamento/detalhes/${forma.id}`)}
                      >
                        Detalhes
                      </Button>
                      <Button
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/financeiro/formas-pagamento/editar/${forma.id}`)}
                      >
                        Editar
                      </Button>
                      {Boolean(forma.ativo) && (
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => openDeleteModal(forma)}
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
      </CardBody>
      <DeleteConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onDelete={() => handleDelete(formaPagamentoParaExcluir?.id)}
        itemName={formaPagamentoParaExcluir?.descricao || 'N/A'}
        itemType="forma de pagamento"
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a forma de pagamento "${formaPagamentoParaExcluir?.descricao}"?\nEsta ação não poderá ser desfeita.`}
      />
    </Card>
  );
};

export default FormaPagamentoList;
