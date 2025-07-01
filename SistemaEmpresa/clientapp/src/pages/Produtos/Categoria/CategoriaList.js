import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Alert, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

moment.locale('pt-br');

const CategoriaList = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [filtroSituacao, setFiltroSituacao] = useState('ativos');

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    aplicarFiltros(categorias, filtroSituacao);
  }, [filtroSituacao, categorias]);

  const isAtivo = (categoria) => {
    return categoria.situacao && categoria.situacao !== '0001-01-01T00:00:00';
  };

  const aplicarFiltros = (data, filtroSit) => {
    if (!data || !Array.isArray(data)) {
      setCategoriasFiltradas([]);
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
    setCategoriasFiltradas(resultado);
  };

  const carregarCategorias = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Categoria');
      const data = await response.json();
      setCategorias(data);
      aplicarFiltros(data, filtroSituacao);
      setError(null);
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível carregar as categorias.' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (categoria) => {
    setCategoriaParaExcluir(categoria);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/Categoria/${id}`, { method: 'DELETE' });
      setModalOpen(false);
      setCategoriaParaExcluir(null);
      setError({ type: 'success', message: 'Categoria inativada com sucesso!' });
      setTimeout(() => setError(null), 3000);
      carregarCategorias();
    } catch (err) {
      setError({ type: 'danger', message: 'Não foi possível inativar a categoria.' });
    }
  };

  if (loading) {
    return <div className="text-center my-5"><span>Carregando...</span></div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Categorias</h3>
          <Link to="/produtos/categoria/novo">
            <Button color="primary">
              + Nova Categoria
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
          Exibindo {categoriasFiltradas.length} {categoriasFiltradas.length === 1 ? 'categoria' : 'categorias'}
          {filtroSituacao !== 'todos' ? ` (${filtroSituacao === 'ativos' ? 'somente ativas' : 'somente inativas'})` : ''}
        </div>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Situação</th>
              <th>Data Criação</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Nenhuma categoria encontrada.</td>
              </tr>
            ) : (
              categoriasFiltradas.map(categoria => (
                <tr key={categoria.id}>
                  <td>{categoria.categoriaNome || '-'}</td>
                  <td>
                    {isAtivo(categoria) ? (
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
                    {categoria.dataCriacao ? moment(categoria.dataCriacao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{categoria.userCriacao || 'Sistema'}</small>
                  </td>
                  <td>
                    {categoria.dataAlteracao ? moment(categoria.dataAlteracao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    <small className="d-block text-muted">{categoria.userAtualizacao || 'Sistema'}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/produtos/categoria/detalhes/${categoria.id}`} className="btn btn-sm btn-primary">
                        Detalhes
                      </Link>
                      <Link to={`/produtos/categoria/editar/${categoria.id}`} className="btn btn-sm btn-info">
                        Editar
                      </Link>
                      <Button color="danger" size="sm" onClick={() => openDeleteModal(categoria)}>
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
        onDelete={() => handleDelete(categoriaParaExcluir?.id)}
        itemName={categoriaParaExcluir?.categoriaNome || 'N/A'}
        itemType="categoria"
        title="Confirmar Exclusão"
      />
    </Card>
  );
};

export default CategoriaList;
