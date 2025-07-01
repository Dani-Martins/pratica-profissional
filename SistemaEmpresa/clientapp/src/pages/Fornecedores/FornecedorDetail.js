import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardBody, Button, Row, Col, 
  Table, Alert, Spinner, Badge, Nav, NavItem, NavLink, TabContent, TabPane 
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faArrowLeft, faUser, faShoppingCart, faFileAlt, 
  faMapMarkerAlt, faInfoCircle, faCalendarAlt, faClock, faUserEdit
} from '@fortawesome/free-solid-svg-icons';
import { useDataContext } from '../../contexts/DataContext';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FornecedorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  const [fornecedor, setFornecedor] = useState(null);
  const [activeTab, setActiveTab] = useState('1');  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Função auxiliar para formatar datas de forma segura
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Adicionar mais logs para debug
      console.log('Formato da data recebida:', data);
      console.log('Tipo da data:', typeof data);
      
      // Forçar a conversão da string para objeto Date (se for uma string)
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      
      // Usar o moment para tentar formatar a data com hora
      const dataFormatada = moment(dataObj).format('DD/MM/YYYY HH:mm');
      console.log('Data após formatação:', dataFormatada);
      
      // Verificar se a data formatada é válida
      if (dataFormatada === 'Invalid date') {
        console.error('Data inválida recebida:', data);
        return 'N/A';
      }
      
      return dataFormatada;
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'N/A';
    }
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    telefone = telefone.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (telefone.length <= 10) {
      // Telefone fixo
      telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
      telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Celular
      telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
      telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return telefone;
  };

  // Função para formatar valores monetários
  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    const fetchFornecedor = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados do fornecedor usando apiClient
        const response = await apiClient.get(`/Fornecedor/${id}`);
        const data = response.data;
        console.log('Fornecedor carregado com sucesso (raw):', data);
        
        // Verificar e normalizar os nomes dos campos para garantir acesso correto
        const fornecedorNormalizado = {
          ...data,
          dataCriacao: data.dataCriacao || data.DataCriacao || null,
          dataAlteracao: data.dataAlteracao || data.DataAlteracao || null,
          userCriacao: data.userCriacao || data.UserCriacao || 'Sistema',
          userAtualizacao: data.userAtualizacao || data.UserAtualizacao || 'Sistema'
        };
        
        console.log('Fornecedor normalizado:', fornecedorNormalizado);
        
        // Adicionar logs detalhados para verificar as datas
        console.log('Datas do fornecedor detalhadas:', {
          dataCriacao: fornecedorNormalizado.dataCriacao,
          tipoDaCriacao: typeof fornecedorNormalizado.dataCriacao,
          dataAlteracao: fornecedorNormalizado.dataAlteracao,
          tipoDataAlteracao: typeof fornecedorNormalizado.dataAlteracao,
          dataCriacaoFormatada: formatarData(fornecedorNormalizado.dataCriacao),
          dataAlteracaoFormatada: formatarData(fornecedorNormalizado.dataAlteracao),
          userCriacao: fornecedorNormalizado.userCriacao,
          userAtualizacao: fornecedorNormalizado.userAtualizacao
        });          // Se tem ID de condição de pagamento mas não tem o objeto, tentar carregar
          if (fornecedorNormalizado.condicaoPagamentoId && !fornecedorNormalizado.condicaoPagamento) {
            try {
              console.log(`Carregando condição de pagamento ID: ${fornecedorNormalizado.condicaoPagamentoId}`);
              const condicaoResponse = await apiClient.get(`/CondicaoPagamento/${fornecedorNormalizado.condicaoPagamentoId}`);
              if (condicaoResponse.data) {
                fornecedorNormalizado.condicaoPagamento = condicaoResponse.data;
                console.log(`Condição de pagamento carregada com sucesso: ${fornecedorNormalizado.condicaoPagamento.descricao}`);
              }
            } catch (err) {
              console.error(`Erro ao carregar condição de pagamento:`, err);
            }
          }
          
          setFornecedor(fornecedorNormalizado);
          setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar fornecedor:", err);
        setError('Erro ao carregar fornecedor: ' + (err.message || 'Ocorreu um erro desconhecido'));
        setLoading(false);
      }
    };
    
    fetchFornecedor();
  }, [id]);  
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do fornecedor...</p>
      </div>
    );
  }

  if (error) {
    return <Alert color="danger" timeout={0}>{error}</Alert>;
  }
  
  if (!fornecedor) {
    return <Alert color="warning">Fornecedor não encontrado</Alert>;
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>Detalhes do Fornecedor</h2>        <div className="d-flex gap-2">
          <Button 
            color="primary" 
            onClick={() => navigate(`/fornecedores/editar/${id}`)}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Editar
          </Button>
          <Button 
            color="secondary" 
            onClick={() => navigate('/fornecedores')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardBody>
          <Row>
            <Col md={8}>
              <h3>
                {fornecedor.tipoPessoa === 'F' 
                  ? fornecedor.nome 
                  : fornecedor.razaoSocial || fornecedor.nomeFantasia || 'Nome não disponível'}
              </h3>
              <p className="text-muted mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {fornecedor.tipoPessoa === 'F' 
                  ? (fornecedor.cpf || 'CPF não disponível') 
                  : (fornecedor.cnpj || 'CNPJ não disponível')}
              </p>
              <p>
                <Badge color={fornecedor.ativo ? 'success' : 'danger'}>
                  {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                {fornecedor.tipoPessoa && (
                  <Badge 
                    className="ms-2" 
                    color={fornecedor.tipoPessoa === 'F' ? 'info' : 'warning'}
                  >
                    {fornecedor.tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                )}
              </p>
              <hr />
              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Email:</strong></p>
                  <p>{fornecedor.email || 'Não informado'}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Telefone:</strong></p>
                  <p>{fornecedor.telefone || 'Não informado'}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>                  <p className="mb-1"><strong>Contato:</strong></p>
                  <p>{fornecedor.contato ? formatarTelefone(fornecedor.contato) : 'Não informado'}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    <strong>Data de Cadastro:</strong>
                  </p>
                  <p>
                    {formatarData(fornecedor.dataCriacao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {fornecedor.userCriacao || 'Sistema'}
                    </small>
                  </p>,
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                    <strong>Última Atualização:</strong>
                  </p>
                  <p>
                    {formatarData(fornecedor.dataAlteracao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {fornecedor.userAtualizacao || 'Sistema'}
                    </small>
                  </p>                </Col>
                <Col md={6}>                  <p className="mb-1"><strong>Condição de Pagamento:</strong></p>
                  <p>{fornecedor.condicaoPagamento ? 
                    `${fornecedor.condicaoPagamento.descricao} ${fornecedor.condicaoPagamento.numeroParcelas ? `(${fornecedor.condicaoPagamento.numeroParcelas}x)` : ''}` :
                    (fornecedor.condicaoPagamentoId ? `ID: ${fornecedor.condicaoPagamentoId}` : 'Não definida')
                  }</p>
                  <p className="mb-1"><strong>Limite de Crédito:</strong></p>
                  <p>{formatarMoeda(fornecedor.limiteCredito || 0)}</p>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <Card className="bg-light">
                <CardBody>
                  <h5>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Endereço
                  </h5>                  <address>
                    {fornecedor.endereco || ''} {fornecedor.numero || ''}
                    {fornecedor.complemento && <><br />{fornecedor.complemento}</>}
                    <br />
                    {fornecedor.bairro || ''}
                    <br />
                    {fornecedor.cidade?.nome || ''} {fornecedor.cidade?.estado?.uf || ''}
                    <br />
                    CEP: {fornecedor.cep || 'Não informado'}
                  </address>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Nav tabs>
        <NavItem>
          <NavLink
            className={activeTab === '1' ? 'active' : ''}
            onClick={() => toggle('1')}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Informações Adicionais
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === '2' ? 'active' : ''}
            onClick={() => toggle('2')}
          >
            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
            Produtos Fornecidos
          </NavLink>
        </NavItem>
      </Nav>
      
      <TabContent activeTab={activeTab} className="p-4 border border-top-0 rounded-bottom mb-4">
        <TabPane tabId="1">
          <h4>Informações Adicionais</h4>
          <Row>
            <Col md={6}>
              {fornecedor.tipoPessoa === 'F' && (
                <>
                  <p className="mb-1"><strong>RG:</strong></p>
                  <p>{fornecedor.rg || 'Não informado'}</p>
                </>
              )}
              
              {fornecedor.tipoPessoa === 'J' && (
                <>
                  <p className="mb-1"><strong>Nome Fantasia:</strong></p>
                  <p>{fornecedor.nomeFantasia || 'Não informado'}</p>
                  
                  <p className="mb-1"><strong>Inscrição Estadual:</strong></p>
                  <p>{fornecedor.inscricaoEstadual || 'Não informado'}</p>
                </>
              )}
            </Col>
            <Col md={6}>
              <Card className="mb-3 bg-light">
                <CardBody>
                  <h6 className="mb-3">Informações de Registro</h6>
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    <strong>Cadastrado em:</strong>
                  </p>
                  <p>
                    {formatarData(fornecedor.dataCriacao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {fornecedor.userCriacao || 'Sistema'}
                    </small>
                  </p>
                  
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                    <strong>Última atualização:</strong>
                  </p>
                  <p>
                    {formatarData(fornecedor.dataAlteracao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {fornecedor.userAtualizacao || 'Sistema'}
                    </small>
                  </p>
                  
                  <p className="mb-1"><strong>ID no sistema:</strong></p>
                  <p>{fornecedor.id}</p>
                </CardBody>
              </Card>
                  <p className="mb-1"><strong>Observações:</strong></p>
              <p>{fornecedor.observacao || 'Nenhuma observação registrada.'}</p>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <h4>Produtos Fornecidos</h4>
          <p>Este fornecedor não possui produtos registrados no sistema.</p>
          {/* Quando tivermos integração com o módulo de produtos, podemos exibir uma tabela aqui */}
        </TabPane>      </TabContent>
    </div>
  );
};

export default FornecedorDetail;
