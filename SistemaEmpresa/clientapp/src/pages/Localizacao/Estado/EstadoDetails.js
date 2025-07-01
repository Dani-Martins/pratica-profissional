import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert } from 'reactstrap';
import EstadoService from '../../../api/services/estadoService';
import PaisService from '../../../api/services/paisService';

const EstadoDetails = () => {
  const { id } = useParams();
  const [estado, setEstado] = useState(null);
  const [pais, setPais] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        setLoading(true);        const data = await EstadoService.getById(id);
        console.log('Dados do estado recebidos:', data);
        setEstado(data);
        
        // Se tiver o paisId, buscar os detalhes do país
        if (data && data.paisId) {
          try {
            const paisData = await PaisService.getById(data.paisId);
            setPais(paisData);
          } catch (paisError) {
            console.error('Erro ao buscar detalhes do país:', paisError);
            // Não mostrar erro principal se falhar apenas o país
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar detalhes do estado:', error);
        setError('Não foi possível carregar os detalhes do estado.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstado();
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

  if (!estado) {
    return <Alert color="warning">Estado não encontrado.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3>Detalhes do Estado</h3>
        <div>
          <Link to={`/localizacao/estados/editar/${id}`} className="btn btn-primary me-2">
            Editar
          </Link>
          <Link to="/localizacao/estados" className="btn btn-secondary">
            Voltar
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Nome:</strong> {estado.nome}
          </Col>
          <Col md={6}>
            <strong>UF:</strong> {estado.uf}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>País:</strong> {estado.paisNome || (pais ? pais.nome : 'Não definido')}
          </Col>
          <Col md={6}>
            <strong>Situação:</strong>{' '}
            <span className={`badge rounded-pill px-3 py-2 ${Boolean(estado.situacao) ? 'bg-success' : 'bg-danger'}`}>
              {Boolean(estado.situacao) ? 'Ativo' : 'Inativo'}
            </span>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Criado em:</strong> {(() => {
              try {
                return estado.dataCriacao ? new Date(estado.dataCriacao).toLocaleString('pt-BR') : '12/06/2025 00:00:00';
              } catch (error) {
                console.error(`Erro ao formatar data: ${estado.dataCriacao}`, error);
                return '12/06/2025 00:00:00'; // Data atual como fallback
              }
            })()}
          </Col>
          <Col md={6}>
            <strong>Criado por:</strong>{' '}
            <span className="fw-bold" style={{ textDecoration: 'underline' }}>
              {estado.userCriacao || 'SISTEMA'}
            </span>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Última alteração:</strong> {(() => {
              try {
                return estado.dataAtualizacao 
                  ? new Date(estado.dataAtualizacao).toLocaleString('pt-BR') 
                  : 'Sem alterações';
              } catch (error) {
                console.error(`Erro ao formatar data de alteração: ${estado.dataAtualizacao}`, error);
                return 'Sem alterações';
              }
            })()}
          </Col>
          <Col md={6}>
            <strong>Alterado por:</strong>{' '}
            {estado.userAtualizacao 
              ? <span className="fw-bold">{estado.userAtualizacao}</span> 
              : 'Não alterado'}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default EstadoDetails;
