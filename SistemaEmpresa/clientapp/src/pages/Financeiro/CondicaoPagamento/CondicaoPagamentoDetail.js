import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert, Badge, Table } from 'reactstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const CondicaoPagamentoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [condicao, setCondicao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/CondicaoPagamento/${id}`);
        setCondicao(response.data);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os detalhes da condição de pagamento.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="d-flex justify-content-center my-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!condicao) {
    return <Alert color="warning">Condição de pagamento não encontrada.</Alert>;
  }

  return (
    <Card className="p-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Detalhes da Condição de Pagamento</h3>
        <div>
          <Button color="primary" className="me-2" onClick={() => navigate(`/financeiro/condicoes-pagamento/editar/${condicao.id}`)}>
            Editar
          </Button>
          <Button color="secondary" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={4}><strong>Código:</strong> {condicao.codigo}</Col>
          <Col md={4}><strong>Descrição:</strong> {condicao.descricao}</Col>
          <Col md={4}><strong>À Vista:</strong> {condicao.aVista ? 'Sim' : 'Não'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}><strong>Juros (%):</strong> {condicao.percentualJuros}</Col>
          <Col md={4}><strong>Multa (%):</strong> {condicao.percentualMulta}</Col>
          <Col md={4}><strong>Desconto (%):</strong> {condicao.percentualDesconto}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}><strong>Situação:</strong> {condicao.ativo ? <Badge color="success">Ativo</Badge> : <Badge color="danger">Inativo</Badge>}</Col>
          <Col md={4}><strong>Data Criação:</strong> {condicao.data_cadastro ? moment(condicao.data_cadastro).format('L LT') : 'N/A'}</Col>
          <Col md={4}><strong>Criado por:</strong> {condicao.userCriacao || 'Sistema'}</Col>
        </Row>
        <h5 className="mt-4">Parcelas</h5>
        <Table responsive bordered size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Dias</th>
              <th>Percentual (%)</th>
              <th>Forma de Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {condicao.parcelas && condicao.parcelas.length > 0 ? (
              condicao.parcelas.map((parcela, idx) => (
                <tr key={parcela.id}>
                  <td>{parcela.numero}</td>
                  <td>{parcela.dias}</td>
                  <td>{parcela.percentual}</td>
                  <td>{parcela.formaPagamentoDescricao}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center">Nenhuma parcela cadastrada.</td></tr>
            )}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default CondicaoPagamentoDetail;
