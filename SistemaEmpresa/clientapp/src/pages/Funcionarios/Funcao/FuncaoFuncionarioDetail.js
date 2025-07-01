import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, CardBody, Button, Row, Col, Alert, Badge, Spinner, Container
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useDataContext } from '../../../contexts/DataContext';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FuncaoFuncionarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  
  const [funcao, setFuncao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Função auxiliar para formatar datas de forma segura
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Primeiro tenta diretamente com o moment
      if (moment(data).isValid()) {
        return moment(data).format('DD/MM/YYYY HH:mm:ss');
      }
      
      // Depois tenta converter para Date primeiro
      const dataObj = new Date(data);
      if (!isNaN(dataObj.getTime())) {
        return moment(dataObj).format('DD/MM/YYYY HH:mm:ss');
      }
      
      // Se ainda não conseguiu, verifica se é uma string no formato ISO
      if (typeof data === 'string' && data.includes('T')) {
        return moment(data.split('T')[0] + 'T' + data.split('T')[1].split('.')[0]).format('DD/MM/YYYY HH:mm:ss');
      }
      
      return 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'Erro';
    }
  };

  useEffect(() => {
    carregarFuncao();
  }, [id]);

  const carregarFuncao = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/FuncaoFuncionario/${id}`);
      setFuncao(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar função:', err);
      setError('Não foi possível carregar os detalhes da função. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função de formatação para o campo de carga horária
  const formatarCargaHoraria = (horas) => {
    if (horas === null || horas === undefined || horas === '') {
      return 'Não definida';
    }
    
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando detalhes da função...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="danger" className="my-4">
          {error}
        </Alert>
        <div className="text-center">
          <Button color="secondary" onClick={() => navigate('/funcionarios/funcoes')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar para a lista
          </Button>
        </div>
      </Container>
    );
  }

  if (!funcao) {
    return (
      <Container>
        <Alert color="warning" className="my-4">
          Função não encontrada.
        </Alert>
        <div className="text-center">
          <Button color="secondary" onClick={() => navigate('/funcionarios/funcoes')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar para a lista
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Detalhes da Função de Funcionário</h3>
            <div>
              <Link to={`/funcionarios/funcoes/editar/${funcao.id}`} className="btn btn-primary me-2">
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Editar
              </Link>
              <Button color="secondary" onClick={() => navigate('/funcionarios/funcoes')}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Voltar
              </Button>
            </div>
          </div>
          
          <Row className="mb-4">
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {funcao.funcaoFuncionarioNome || 'Função não especificada'}
                  <Badge 
                    color={funcao.ativo ? 'success' : 'danger'} 
                    className="ms-3 px-3 py-2"
                  >
                    {funcao.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </h4>
              </div>
            </Col>
          </Row>

          <Card className="mb-4">
            <CardBody>
              <h5 className="mb-3">Informações da Função</h5>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">ID:</Col>
                <Col md={9}>{funcao.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Função de Funcionário:</Col>
                <Col md={9}>{funcao.funcaoFuncionarioNome || 'Não especificada'}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Descrição:</Col>
                <Col md={9}>{funcao.descricao || 'Sem descrição'}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Carga Horária:</Col>
                <Col md={9}>{formatarCargaHoraria(funcao.cargaHoraria)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Requer CNH:</Col>
                <Col md={9}>{funcao.requerCNH ? 'Sim' : 'Não'}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Situação:</Col>
                <Col md={9}>
                  <Badge 
                    color={funcao.ativo ? 'success' : 'danger'} 
                    className="px-3 py-2"
                  >
                    {funcao.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Col>
              </Row>
              {funcao.observacao && (
                <Row className="mb-2">
                  <Col md={3} className="fw-bold">Observações:</Col>
                  <Col md={9}>{funcao.observacao || 'Nenhuma observação'}</Col>
                </Row>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h5 className="mb-3">Informações do Sistema</h5>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Data de Criação:</Col>
                <Col md={9}>
                  {formatarData(funcao.dataCriacao)}
                  {funcao.userCriacao && (
                    <small className="d-block text-muted">por {funcao.userCriacao}</small>
                  )}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold">Última Atualização:</Col>
                <Col md={9}>
                  {funcao.dataAlteracao ? formatarData(funcao.dataAlteracao) : 'Sem atualizações'}
                  {funcao.dataAlteracao && funcao.userAtualizacao && (
                    <small className="d-block text-muted">por {funcao.userAtualizacao}</small>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </CardBody>
      </Card>


    </Container>
  );
};

export default FuncaoFuncionarioDetail;
