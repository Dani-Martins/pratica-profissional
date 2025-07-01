import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert } from 'reactstrap';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const CategoriaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/Categoria/${id}`)
      .then(res => res.json())
      .then(data => {
        setCategoria(data);
        setError(null);
      })
      .catch(() => setError('Não foi possível carregar os detalhes da categoria.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="d-flex justify-content-center my-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!categoria) {
    return <Alert color="warning">Categoria não encontrada.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Detalhes da Categoria</h3>
        <div>
          <Button color="primary" className="me-2" onClick={() => navigate(`/produtos/categoria/editar/${categoria.id}`)}>
            Editar
          </Button>
          <Button color="secondary" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Categoria:</strong> {categoria.categoriaNome || categoria.nome || '-'}
            </div>
            <div className="mb-2">
              <strong>Criado em:</strong> {categoria.dataCriacao ? moment(categoria.dataCriacao).format('DD/MM/YYYY, HH:mm:ss') : 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Última alteração:</strong> {categoria.dataAlteracao ? moment(categoria.dataAlteracao).format('DD/MM/YYYY, HH:mm:ss') : 'Sem alterações'}
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-md-end align-items-start">
            <div className="mb-2">
              <strong>Situação:</strong>{' '}
              <span className={`badge rounded-pill px-3 py-2 ${categoria.situacao ? 'bg-success' : 'bg-danger'}`} style={{fontSize: 15, fontWeight: 600}}>
                {categoria.situacao && categoria.situacao !== '0001-01-01T00:00:00' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="mb-2">
              <strong>Criado por:</strong>{' '}
              <span className="fw-bold" style={{ textDecoration: 'underline' }}>{categoria.userCriacao ? categoria.userCriacao.toUpperCase() : 'SISTEMA'}</span>
            </div>
            <div className="mb-2">
              <strong>Alterado por:</strong>{' '}
              {categoria.userAtualizacao ? <span className="fw-bold">{categoria.userAtualizacao}</span> : 'Sistema'}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CategoriaDetail;
