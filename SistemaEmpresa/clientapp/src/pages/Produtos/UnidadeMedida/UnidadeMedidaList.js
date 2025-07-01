import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

moment.locale('pt-br');

const UnidadeMedidaList = () => {
  const [unidades, setUnidades] = useState([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unidadeParaExcluir, setUnidadeParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos');

  useEffect(() => {
    carregarUnidades();
  }, []);

  useEffect(() => {
    aplicarFiltros(unidades, filtroSituacao);
  }, [filtroSituacao, unidades]);

  const isAtivo = (unidade) => {
    // Considera ativo se situacao for diferente de '0001-01-01T00:00:00'
    return unidade.situacao && unidade.situacao !== '0001-01-01T00:00:00';
  };

  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setUnidadesFiltradas([]);
      return;
    }
    let resultado = [...data];
    switch(filtroSit) {
      case 'ativos':
        resultado = resultado.filter(u => isAtivo(u));
        break;
      case 'inativos':
        resultado = resultado.filter(u => !isAtivo(u));
        break;
      case 'todos':
      default:
        break;
    }
    setUnidadesFiltradas(resultado);
  };

  const carregarUnidades = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/UnidadeMedida');
      const data = await response.json();
      setUnidades(data);
      aplicarFiltros(data, filtroSituacao);
      setError(null);
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível carregar as unidades de medida.' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (unidade) => {
    setUnidadeParaExcluir(unidade);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/UnidadeMedida/${id}`, { method: 'DELETE' });
      setModalOpen(false);
      setUnidadeParaExcluir(null);
      setError({ type: 'success', message: 'Unidade de medida inativada com sucesso!' });
      setTimeout(() => setError(null), 3000);
      carregarUnidades();
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível inativar a unidade de medida.' });
    }
  };

  if (loading) {
    return <div className="text-center my-5"><span>Carregando...</span></div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Unidades de Medida</h3>
          <Link to="/produtos/unidademedida/novo">
            <Button color="primary">
              + Nova Unidade de Medida
            </Button>
          </Link>
        </div>

        {error && (
          <Alert color={error.type === 'success' ? 'success' : 'danger'} fade={false}>
            {error.message || error}
          </Alert>
        )}

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
          Exibindo {unidadesFiltradas.length} {unidadesFiltradas.length === 1 ? 'unidade de medida' : 'unidades de medida'}
          {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativas' : 'somente inativas'})` : ''}
        </div>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Unidade de Medida</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Nenhuma unidade de medida encontrada.</td>
              </tr>
            ) : (
              unidadesFiltradas.map(unidade => (
                <tr key={unidade.id}>
                  <td>{unidade.unidadeMedidaNome || '-'}</td>
                  <td>
                    {isAtivo(unidade) ? (
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
                    {unidade.dataCriacao ? moment(unidade.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{unidade.userCriacao || 'Sistema'}</small>
                  </td>
                  <td>
                    {unidade.dataAlteracao ? moment(unidade.dataAlteracao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{unidade.userAtualizacao || 'Sistema'}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/produtos/unidademedida/detalhes/${unidade.id}`} className="btn btn-sm btn-primary">
                        Detalhes
                      </Link>
                      <Link to={`/produtos/unidademedida/editar/${unidade.id}`} className="btn btn-sm btn-info">
                        Editar
                      </Link>
                      <Button color="danger" size="sm" onClick={() => openDeleteModal(unidade)}>
                        Excluir
                      </Button>
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
        onDelete={() => handleDelete(unidadeParaExcluir?.id)}
        itemName={unidadeParaExcluir?.unidadeMedidaNome || 'N/A'}
        itemType="unidade de medida"
        title="Confirmar Exclusão"
      />
    </Card>
  );
};

export default UnidadeMedidaList;
