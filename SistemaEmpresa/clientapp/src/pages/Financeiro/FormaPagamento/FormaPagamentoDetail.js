import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert, Badge } from 'reactstrap';
import { useDataContext } from '../../../contexts/DataContext';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const FormaPagamentoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  const [forma, setForma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/FormaPagamento/${id}`);
        setForma(response.data);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os detalhes da forma de pagamento.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, apiClient]);

  if (loading) {
    return <div className="d-flex justify-content-center my-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!forma) {
    return <Alert color="warning">Forma de pagamento não encontrada.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Detalhes da Forma de Pagamento</h3>
        <div>
          <Button color="primary" className="me-2" onClick={() => navigate(`/financeiro/formas-pagamento/editar/${forma.id}`)}>
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
            <strong>Descrição:</strong> {forma.descricao}
          </Col>
          <Col md={6}>
            <strong>Situação:</strong>{' '}
            <span className={`badge rounded-pill px-3 py-2 ${forma.ativo ? 'bg-success' : 'bg-danger'}`}>
              {forma.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Criado em:</strong> {forma.dataCriacao ? moment(forma.dataCriacao).format('DD/MM/YYYY, HH:mm:ss') : 'N/A'}
          </Col>
          <Col md={6}>
            <strong>Criado por:</strong>{' '}
            <span className="fw-bold" style={{ textDecoration: 'underline' }}>{forma.userCriacao || 'SISTEMA'}</span>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Última alteração:</strong> {forma.dataAlteracao ? moment(forma.dataAlteracao).format('DD/MM/YYYY, HH:mm:ss') : 'Sem alterações'}
          </Col>
          <Col md={6}>
            <strong>Alterado por:</strong>{' '}
            {forma.userAtualizacao ? <span className="fw-bold">{forma.userAtualizacao}</span> : 'Não alterado'}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default FormaPagamentoDetail;
