import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert } from 'reactstrap';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const UnidadeMedidaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/UnidadeMedida/${id}`)
      .then(res => res.json())
      .then(data => {
        setUnidade(data);
        setError(null);
      })
      .catch(() => setError('Não foi possível carregar os detalhes da unidade de medida.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="d-flex justify-content-center my-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!unidade) {
    return <Alert color="warning">Unidade de medida não encontrada.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Detalhes da Unidade de Medida</h3>
        <div>
          <Button color="primary" className="me-2" onClick={() => navigate(`/produtos/unidademedida/editar/${unidade.id}`)}>
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
              <strong>Unidade de Medida:</strong> {unidade.unidadeMedidaNome || unidade.nome || '-'}
            </div>
            <div className="mb-2">
              <strong>Criado em:</strong> {unidade.dataCriacao ? moment(unidade.dataCriacao).format('DD/MM/YYYY, HH:mm:ss') : 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Última alteração:</strong> {unidade.dataAlteracao ? moment(unidade.dataAlteracao).format('DD/MM/YYYY, HH:mm:ss') : 'Sem alterações'}
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-md-end align-items-start">
            <div className="mb-2">
              <strong>Situação:</strong>{' '}
              <span className={`badge rounded-pill px-3 py-2 ${unidade.situacao || unidade.ativo ? 'bg-success' : 'bg-danger'}`} style={{fontSize: 15, fontWeight: 600}}>
                {(unidade.situacao || unidade.ativo) ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="mb-2">
              <strong>Criado por:</strong>{' '}
              <span className="fw-bold" style={{ textDecoration: 'underline' }}>{unidade.userCriacao ? unidade.userCriacao.toUpperCase() : 'SISTEMA'}</span>
            </div>
            <div className="mb-2">
              <strong>Alterado por:</strong>{' '}
              {unidade.userAtualizacao ? <span className="fw-bold">{unidade.userAtualizacao}</span> : 'Sistema'}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default UnidadeMedidaDetail;
