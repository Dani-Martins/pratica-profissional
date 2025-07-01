import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Spinner, Alert, Badge } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const UnidadeMedidaList = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unidadeParaExcluir, setUnidadeParaExcluir] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/unidademedida');
      setUnidades(response.data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar as unidades de medida.');
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
      await axios.delete(`/api/unidademedida/${id}`);
      setModalOpen(false);
      setUnidadeParaExcluir(null);
      carregarUnidades();
    } catch (err) {
      setError('Erro ao excluir unidade de medida.');
    }
  };

  if (loading) {
    return <div className="text-center my-5"><Spinner color="primary" /></div>;
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Unidades de Medida</h3>
          <Button color="primary" onClick={() => navigate('/produtos/unidademedida/novo')}>+ Nova Unidade</Button>
        </div>
        {error && <Alert color="danger">{error}</Alert>}
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr><td colSpan="3" className="text-center">Nenhuma unidade cadastrada.</td></tr>
            ) : (
              unidades.map(unidade => (
                <tr key={unidade.id}>
                  <td>{unidade.nome}</td>
                  <td>{unidade.ativo ? <Badge color="success">Ativo</Badge> : <Badge color="danger">Inativo</Badge>}</td>
                  <td>
                    <Button color="primary" size="sm" className="me-2" onClick={() => navigate(`/produtos/unidademedida/detalhes/${unidade.id}`)}>Detalhes</Button>
                    <Button color="info" size="sm" className="me-2" onClick={() => navigate(`/produtos/unidademedida/editar/${unidade.id}`)}>Editar</Button>
                    <Button color="danger" size="sm" onClick={() => openDeleteModal(unidade)}>Excluir</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <DeleteConfirmationModal
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
          onDelete={() => handleDelete(unidadeParaExcluir?.id)}
          itemName={unidadeParaExcluir?.nome}
          itemType="unidade de medida"
        />
      </CardBody>
    </Card>
  );
};

export default UnidadeMedidaList;
