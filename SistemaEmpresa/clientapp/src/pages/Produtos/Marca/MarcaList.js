import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

moment.locale('pt-br');

const MarcaList = () => {
  const [marcas, setMarcas] = useState([]);
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [marcaParaExcluir, setMarcaParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos');

  useEffect(() => {
    carregarMarcas();
  }, []);

  useEffect(() => {
    aplicarFiltros(marcas, filtroSituacao);
  }, [filtroSituacao, marcas]);

  const isAtivo = (marca) => {
    return marca.situacao && marca.situacao !== '0001-01-01T00:00:00';
  };

  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setMarcasFiltradas([]);
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
    setMarcasFiltradas(resultado);
  };

  const carregarMarcas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Marca');
      const data = await response.json();
      setMarcas(data);
      aplicarFiltros(data, filtroSituacao);
      setError(null);
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível carregar as marcas.' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (marca) => {
    setMarcaParaExcluir(marca);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/Marca/${id}`, { method: 'DELETE' });
      setModalOpen(false);
      setMarcaParaExcluir(null);
      setError({ type: 'success', message: 'Marca inativada com sucesso!' });
      setTimeout(() => setError(null), 3000);
      carregarMarcas();
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível inativar a marca.' });
    }
  };

  if (loading) {
    return <div className="text-center my-5"><span>Carregando...</span></div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Marcas</h3>
          <Link to="/produtos/marca/novo">
            <Button color="primary">
              + Nova Marca
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
          Exibindo {marcasFiltradas.length} {marcasFiltradas.length === 1 ? 'marca' : 'marcas'}
          {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativas' : 'somente inativas'})` : ''}
        </div>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {marcasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Nenhuma marca encontrada.</td>
              </tr>
            ) : (
              marcasFiltradas.map(marca => (
                <tr key={marca.id}>
                  <td>{marca.marcaNome || '-'}</td>
                  <td>
                    {isAtivo(marca) ? (
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
                    {marca.dataCriacao ? moment(marca.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{marca.userCriacao || 'Sistema'}</small>
                  </td>
                  <td>
                    {marca.dataAlteracao ? moment(marca.dataAlteracao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{marca.userAtualizacao || 'Sistema'}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/produtos/marca/detalhes/${marca.id}`} className="btn btn-sm btn-primary">
                        Detalhes
                      </Link>
                      <Link to={`/produtos/marca/editar/${marca.id}`} className="btn btn-sm btn-info">
                        Editar
                      </Link>
                      <Button color="danger" size="sm" onClick={() => openDeleteModal(marca)}>
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
        onDelete={() => handleDelete(marcaParaExcluir?.id)}
        itemName={marcaParaExcluir?.marcaNome || 'N/A'}
        itemType="marca"
        title="Confirmar Exclusão"
      />
    </Card>
  );
};

export default MarcaList;
