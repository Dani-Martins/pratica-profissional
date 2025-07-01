import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert } from 'reactstrap';
import PaisService from '../../../api/services/paisService';

const PaisDetails = () => {
  const { id } = useParams();
  const [pais, setPais] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPais = async () => {
      try {
        setLoading(true);
        const data = await PaisService.getById(id);
        setPais(data);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar detalhes do país:', error);
        setError('Não foi possível carregar os detalhes do país.');
      } finally {
        setLoading(false);
      }
    };

    fetchPais();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!pais) {
    return <Alert color="warning">País não encontrado.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3>Detalhes do País</h3>
        <div>
          <Link to={`/localizacao/paises/editar/${id}`} className="btn btn-primary me-2">
            Editar
          </Link>
          <Link to="/localizacao/paises" className="btn btn-secondary">
            Voltar
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Nome:</strong> {pais.nome}
          </Col>
          <Col md={6}>
            <strong>Sigla:</strong> {pais.sigla}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Código Telefônico:</strong> {pais.codigo ? `+${pais.codigo}` : 'Não definido'}
          </Col>          <Col md={6}>
            <strong>Situação:</strong>{' '}
            <span className={`badge rounded-pill px-3 py-2 ${Number(pais.situacao) === 1 || pais.situacao === true ? 'bg-success' : 'bg-danger'}`}>
              {Number(pais.situacao) === 1 || pais.situacao === true ? 'Ativo' : 'Inativo'}
            </span>
          </Col>
        </Row>
        <Row className="mb-3">          <Col md={6}>
            <strong>Criado em:</strong> {(() => {
              try {
                return pais.dataCriacao ? new Date(pais.dataCriacao).toLocaleString('pt-BR') : '12/06/2025 00:00:00';
              } catch (error) {
                console.error(`Erro ao formatar data: ${pais.dataCriacao}`, error);
                return '12/06/2025 00:00:00'; // Data atual como fallback
              }
            })()}
          </Col>          <Col md={6}>
            <strong>Criado por:</strong>{' '}
            <span className="fw-bold" style={{ textDecoration: 'underline' }}>
              {pais.userCriacao || 'SISTEMA'}
            </span>
          </Col>        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Última alteração:</strong> {(() => {
              try {
                return pais.dataAlteracao 
                  ? new Date(pais.dataAlteracao).toLocaleString('pt-BR') 
                  : 'Sem alterações';
              } catch (error) {
                console.error(`Erro ao formatar data de alteração: ${pais.dataAlteracao}`, error);
                return 'Sem alterações';
              }
            })()}
          </Col>
          <Col md={6}>
            <strong>Alterado por:</strong>{' '}
            {pais.userAlteracao 
              ? <span className="fw-bold">{pais.userAlteracao}</span> 
              : 'Não alterado'}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default PaisDetails;
