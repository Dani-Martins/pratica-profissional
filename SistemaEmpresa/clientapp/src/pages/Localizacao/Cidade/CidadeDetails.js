import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Row, Col, Button, Spinner, Alert } from 'reactstrap';
import CidadeService from '../../../api/services/cidadeService';
import EstadoService from '../../../api/services/estadoService';
import PaisService from '../../../api/services/paisService';

const CidadeDetails = () => {
  const { id } = useParams();
  const [cidade, setCidade] = useState(null);
  const [estado, setEstado] = useState(null);
  const [pais, setPais] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCidade = async () => {
      try {
        setLoading(true);
        const data = await CidadeService.getById(id);
        console.log('Dados da cidade recebidos:', data);
        setCidade(data);
        
        // Se tiver o estadoId, buscar os detalhes do estado
        if (data && data.estadoId) {
          try {
            const estadoData = await EstadoService.getById(data.estadoId);
            setEstado(estadoData);

            // Se o estado tiver o paisId, buscar os detalhes do país
            if (estadoData && estadoData.paisId) {
              try {
                const paisData = await PaisService.getById(estadoData.paisId);
                setPais(paisData);
              } catch (paisError) {
                console.error('Erro ao buscar detalhes do país:', paisError);
                // Não mostrar erro principal se falhar apenas o país
              }
            }
          } catch (estadoError) {
            console.error('Erro ao buscar detalhes do estado:', estadoError);
            // Não mostrar erro principal se falhar apenas o estado
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar detalhes da cidade:', error);
        setError('Não foi possível carregar os detalhes da cidade.');
      } finally {
        setLoading(false);
      }
    };

    fetchCidade();
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

  if (!cidade) {
    return <Alert color="warning">Cidade não encontrada.</Alert>;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h3>Detalhes da Cidade</h3>
        <div>
          <Link to={`/localizacao/cidades/editar/${id}`} className="btn btn-primary me-2">
            Editar
          </Link>
          <Link to="/localizacao/cidades" className="btn btn-secondary">
            Voltar
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Nome:</strong> {cidade.nome}
          </Col>
          <Col md={6}>
            <strong>Código IBGE:</strong> {cidade.codigoIbge || 'Não definido'}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Estado:</strong> {cidade.estadoNome || (estado ? estado.nome : 'Não definido')}
          </Col>
          <Col md={6}>
            <strong>País:</strong> {cidade.paisNome || (pais ? pais.nome : 'Não definido')}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Situação:</strong>{' '}
            <span className={`badge rounded-pill px-3 py-2 ${Boolean(cidade.situacao) ? 'bg-success' : 'bg-danger'}`}>
              {Boolean(cidade.situacao) ? 'Ativo' : 'Inativo'}
            </span>
          </Col>
          <Col md={6}>
            <strong>Criado em:</strong> {(() => {
              try {
                return cidade.dataCriacao ? new Date(cidade.dataCriacao).toLocaleString('pt-BR') : '12/06/2025 00:00:00';
              } catch (error) {
                console.error(`Erro ao formatar data: ${cidade.dataCriacao}`, error);
                return '12/06/2025 00:00:00'; // Data atual como fallback
              }
            })()}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Criado por:</strong>{' '}
            <span className="fw-bold" style={{ textDecoration: 'underline' }}>
              {cidade.userCriacao || 'SISTEMA'}
            </span>
          </Col>
          <Col md={6}>
            <strong>Última alteração:</strong> {(() => {
              try {
                return cidade.dataAtualizacao 
                  ? new Date(cidade.dataAtualizacao).toLocaleString('pt-BR') 
                  : 'Sem alterações';
              } catch (error) {
                console.error(`Erro ao formatar data de alteração: ${cidade.dataAtualizacao}`, error);
                return 'Sem alterações';
              }
            })()}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Alterado por:</strong>{' '}
            {cidade.userAtualizacao 
              ? <span className="fw-bold">{cidade.userAtualizacao}</span> 
              : 'Não alterado'}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CidadeDetails;
