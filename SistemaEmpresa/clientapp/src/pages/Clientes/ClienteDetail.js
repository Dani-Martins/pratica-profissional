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

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useDataContext();
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
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
  };useEffect(() => {    const fetchCliente = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados reais do cliente usando apiClient
        const response = await apiClient.get(`/Cliente/${id}`);
        const data = response.data;
        console.log('Cliente carregado com sucesso (raw):', data);
        
        // Verificar e normalizar os nomes dos campos para garantir acesso correto
        // Alguns backends podem retornar camelCase, outros PascalCase
        const clienteNormalizado = {
          ...data,
          // Garantir que os campos de data existam com nomes consistentes (camelCase)
          dataCriacao: data.dataCriacao || data.DataCriacao || null,
          dataAlteracao: data.dataAlteracao || data.DataAlteracao || null,
          userCriacao: data.userCriacao || data.UserCriacao || 'Sistema',
          userAtualizacao: data.userAtualizacao || data.UserAtualizacao || 'Sistema'
        };
        
        console.log('Cliente normalizado:', clienteNormalizado);
        
        // Adicionar logs detalhados para verificar as datas
        console.log('Datas do cliente detalhadas:', {
          dataCriacao: clienteNormalizado.dataCriacao,
          tipoDaCriacao: typeof clienteNormalizado.dataCriacao,
          dataAlteracao: clienteNormalizado.dataAlteracao,
          tipoDataAlteracao: typeof clienteNormalizado.dataAlteracao,
          dataCriacaoFormatada: formatarData(clienteNormalizado.dataCriacao),
          dataAlteracaoFormatada: formatarData(clienteNormalizado.dataAlteracao),
          userCriacao: clienteNormalizado.userCriacao,
          userAtualizacao: clienteNormalizado.userAtualizacao
        });
        
        setCliente(clienteNormalizado);
        
        // Por enquanto, inicializar vendas como um array vazio
        // Quando tivermos um serviço de vendas, podemos usá-lo para obter as vendas deste cliente
        setVendas([]);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar cliente:", err);
        setError('Erro ao carregar cliente: ' + (err.message || 'Ocorreu um erro desconhecido'));
        setLoading(false);
      }
    };
    
    fetchCliente();
  }, [id]);
  
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do cliente...</p>
      </div>
    );
  }
    if (error) {
    return <Alert color="danger" timeout={0}>{error}</Alert>;
  }
  
  if (!cliente) {
    return <Alert color="warning">Cliente não encontrado</Alert>;
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>Detalhes do Cliente</h2>
        <div className="d-flex gap-2">
          <Button 
            color="primary" 
            onClick={() => navigate(`/clientes/editar/${id}`)}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Editar
          </Button>
          <Button 
            color="secondary" 
            onClick={() => navigate('/clientes')}
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
                {cliente.tipoPessoa === 'F' 
                  ? cliente.nome 
                  : cliente.razaoSocial || cliente.nomeFantasia || 'Nome não disponível'}
              </h3>
              <p className="text-muted mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {cliente.tipoPessoa === 'F' 
                  ? (cliente.cpf || 'CPF não disponível') 
                  : (cliente.cnpj || 'CNPJ não disponível')}
              </p>
              <p>
                <Badge color={cliente.ativo ? 'success' : 'danger'}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                {cliente.tipoPessoa && (
                  <Badge 
                    className="ms-2" 
                    color={cliente.tipoPessoa === 'F' ? 'info' : 'warning'}
                  >
                    {cliente.tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                )}
              </p>
              <hr />
              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Email:</strong></p>
                  <p>{cliente.email || 'Não informado'}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Telefone:</strong></p>
                  <p>{cliente.telefone || 'Não informado'}</p>
                </Col>
              </Row>              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    <strong>Data de Cadastro:</strong>
                  </p>
                  <p>
                    {formatarData(cliente.dataCriacao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {cliente.userCriacao || 'Sistema'}
                    </small>
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                    <strong>Última Atualização:</strong>
                  </p>
                  <p>
                    {formatarData(cliente.dataAlteracao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {cliente.userAtualizacao || 'Sistema'}
                    </small>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  {cliente.condicaoPagamento && (
                    <>
                      <p className="mb-1"><strong>Condição de Pagamento:</strong></p>
                      <p>{cliente.condicaoPagamento.descricao}</p>
                    </>
                  )}
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <Card className="bg-light">
                <CardBody>
                  <h5>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Endereço
                  </h5>
                  <address>
                    {cliente.endereco || ''} {cliente.numero || ''}
                    {cliente.complemento && <><br />{cliente.complemento}</>}
                    <br />
                    {cliente.bairro || ''}
                    <br />
                    {cliente.cidade?.nome || ''} {cliente.cidade?.estado?.uf || ''}
                    <br />
                    CEP: {cliente.cep || 'Não informado'}
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
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Histórico de Vendas
          </NavLink>
        </NavItem>
      </Nav>
      
      <TabContent activeTab={activeTab} className="p-4 border border-top-0 rounded-bottom mb-4">        <TabPane tabId="1">
          <h4>Informações Adicionais</h4>
          <Row>
            <Col md={6}>
              {cliente.tipoPessoa === 'F' && (
                <>
                  <p className="mb-1"><strong>RG:</strong></p>
                  <p>{cliente.rg || 'Não informado'}</p>
                    <p className="mb-1"><strong>Data de Nascimento:</strong></p>
                  <p>{cliente.dataNascimento 
                    ? moment(cliente.dataNascimento).format('DD/MM/YYYY') 
                    : 'Não informado'}</p>
                    
                  <p className="mb-1"><strong>Estado Civil:</strong></p>
                  <p>{cliente.estadoCivil || 'Não informado'}</p>
                  
                  <p className="mb-1"><strong>Sexo:</strong></p>
                  <p>{cliente.sexo || 'Não informado'}</p>
                </>
              )}
              
              {cliente.tipoPessoa === 'J' && (
                <>
                  <p className="mb-1"><strong>Nome Fantasia:</strong></p>
                  <p>{cliente.nomeFantasia || 'Não informado'}</p>
                  
                  <p className="mb-1"><strong>Inscrição Estadual:</strong></p>
                  <p>{cliente.inscricaoEstadual || 'Não informado'}</p>
                </>
              )}
              
              <p className="mb-1"><strong>Nacionalidade:</strong></p>
              <p>{cliente.nacionalidade || 'Não informado'}</p>
              
              <p className="mb-1"><strong>É Brasileiro:</strong></p>
              <p>{cliente.isBrasileiro === true 
                ? 'Sim' 
                : cliente.isBrasileiro === false 
                  ? 'Não' 
                  : 'Não informado'}</p>
            </Col>
            <Col md={6}>
              <p className="mb-1"><strong>Limite de Crédito:</strong></p>
              <p>{cliente.limiteCredito 
                ? parseFloat(cliente.limiteCredito).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })
                : 'Não informado'}</p>
              
              <Card className="mb-3 bg-light">
                <CardBody>                  <h6 className="mb-3">Informações de Registro</h6>
                    <p className="mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    <strong>Cadastrado em:</strong>
                  </p>
                  <p>
                    {formatarData(cliente.dataCriacao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {cliente.userCriacao || 'Sistema'}
                    </small>
                  </p>
                  
                  <p className="mb-1">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                    <strong>Última atualização:</strong>
                  </p>
                  <p>
                    {formatarData(cliente.dataAlteracao)}
                    <small className="d-block text-muted">
                      <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                      {cliente.userAtualizacao || 'Sistema'}
                    </small>
                  </p>
                  
                  <p className="mb-1"><strong>ID no sistema:</strong></p>
                  <p>{cliente.id}</p>
                </CardBody>
              </Card>
                
              <p className="mb-1"><strong>Observações:</strong></p>
              <p>{cliente.observacao || 'Nenhuma observação registrada.'}</p>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <h4>Histórico de Vendas</h4>
          <p>Este cliente não possui vendas registradas no sistema.</p>
          {/* Quando tivermos integração com o módulo de vendas, podemos exibir uma tabela aqui */}
        </TabPane>
      </TabContent>
    </div>
  );
};

export default ClienteDetail;