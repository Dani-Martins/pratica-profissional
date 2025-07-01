import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardBody, Button, Row, Col, 
  Table, Alert, Spinner, Badge, Nav, NavItem, NavLink, TabContent, TabPane,
  Modal
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faArrowLeft, faUser, faIdCard, faFileAlt, 
  faMapMarkerAlt, faInfoCircle, faCalendarAlt, faClock, faUserEdit, faEnvelope, faPhone,
  faAddressCard, faPassport, faTrashAlt, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

// Modal de confirmação de exclusão - modelo a ser usado nas páginas de listagem
// Este componente segue o padrão visual da página de clientes
const ModalExclusao = ({ isOpen, toggle, funcionario, onExcluir, excluindo }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <div className="position-relative p-4">
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: '15px', right: '15px' }}
          onClick={toggle}
          aria-label="Fechar"
        />
        
        <h4 className="mb-4">Confirmar Exclusão</h4>
        
        <div className="d-flex mb-2">
          <div className="me-3">
            <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
              <FontAwesomeIcon icon={faExclamationCircle} className="text-white fa-lg" />
            </div>
          </div>
          <div>
            <p className="mb-1 fw-bold">Tem certeza que deseja excluir o funcionário "{funcionario?.nome}"?</p>
            <p className="text-muted mb-0">Esta ação não poderá ser desfeita.</p>
          </div>
        </div>
        
        <div className="mt-4 d-flex">
          <Button 
            color="danger" 
            onClick={onExcluir} 
            className="me-2" 
            disabled={excluindo}
          >
            {excluindo ? <Spinner size="sm" /> : 'Excluir'}
          </Button>
          <Button 
            color="secondary" 
            onClick={toggle}
            disabled={excluindo}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const FuncionarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Função auxiliar para formatar datas de forma segura
  const formatarData = (data) => {
    if (!data) return 'N/A';
    
    try {
      // Forçar a conversão da string para objeto Date (se for uma string)
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      
      // Usar o moment para tentar formatar a data com hora
      const dataFormatada = moment(dataObj).format('DD/MM/YYYY HH:mm');
      return dataFormatada !== 'Invalid date' ? dataFormatada : 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data:', err, data);
      return 'Erro';
    }
  };
  
  // Função para formatar apenas a data sem hora
  const formatarDataSimples = (data) => {
    if (!data) return 'N/A';
    
    try {
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      const dataFormatada = moment(dataObj).format('DD/MM/YYYY');
      return dataFormatada !== 'Invalid date' ? dataFormatada : 'Formato inválido';
    } catch (err) {
      console.error('Erro ao formatar data simples:', err, data);
      return 'Erro';
    }
  };
  
  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return 'N/A';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para obter descrição do sexo
  const obterDescricaoSexo = (sexo) => {
    switch(parseInt(sexo)) {
      case 1: return 'Masculino';
      case 2: return 'Feminino';
      case 3: return 'Outro';
      default: return 'N/A';
    }
  };
  
  // Função para obter descrição do estado civil
  const obterDescricaoEstadoCivil = (estadoCivil) => {
    switch(parseInt(estadoCivil)) {
      case 1: return 'Solteiro(a)';
      case 2: return 'Casado(a)';
      case 3: return 'Divorciado(a)';
      case 4: return 'Viúvo(a)';
      case 5: return 'União Estável';
      case 6: return 'Separado(a)';
      default: return 'N/A';
    }
  };
  
  // Função para obter descrição da nacionalidade
  const obterDescricaoNacionalidade = (nacionalidade, isBrasileiro) => {
    if (isBrasileiro === 1 || isBrasileiro === true) {
      return 'Brasileiro(a)';
    }
    // Aqui você poderia ter uma lógica mais completa para outras nacionalidades
    return nacionalidade ? `Estrangeiro(a) - Código ${nacionalidade}` : 'N/A';
  };

  const carregarFuncionario = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/Funcionario/${id}`);
      console.log('Dados do funcionário carregados:', response.data);
      
      // Carregar dados adicionais como cidade e função se necessário
      let funcionarioCompleto = { ...response.data };
      
      // Carregar informações da cidade se disponível
      if (funcionarioCompleto.cidadeId) {
        try {
          const cidadeResponse = await axios.get(`/api/Cidade/${funcionarioCompleto.cidadeId}`);
          funcionarioCompleto.cidade = cidadeResponse.data;
        } catch (cidadeErr) {
          console.error(`Erro ao carregar cidade para funcionário ${funcionarioCompleto.id}:`, cidadeErr);
        }
      }
      
      setFuncionario(funcionarioCompleto);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar detalhes do funcionário:', err);
      setError('Não foi possível carregar os detalhes do funcionário. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionario();
  }, [id]);

  const handleEditar = () => {
    navigate(`/funcionarios/editar/${id}`);
  };

  const handleVoltar = () => {
    navigate('/funcionarios');
  };

  // Troca de abas
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert color="danger">{error}</Alert>
          <Button color="secondary" onClick={handleVoltar}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!funcionario) {
    return (
      <Card>
        <CardBody>
          <Alert color="warning">Funcionário não encontrado.</Alert>
          <Button color="secondary" onClick={handleVoltar}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-white border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">
            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
            Detalhes do Funcionário
          </h3>
          <div>
            <Button color="primary" className="me-2" onClick={handleEditar}>
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Editar
            </Button>
            <Button color="secondary" onClick={handleVoltar}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Voltar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <Nav tabs className="mb-4">
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => toggleTab('1')}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Informações Gerais
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '2' ? 'active' : ''}
              onClick={() => toggleTab('2')}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              Endereço
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col md="6">
                <Card className="mb-4 border-0 shadow-sm">
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Dados Pessoais
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">Nome</th>
                          <td>{funcionario.nome || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Apelido</th>
                          <td>{funcionario.apelido || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>CPF</th>
                          <td>{formatarCPF(funcionario.cpf) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Data de Nascimento</th>
                          <td>{formatarDataSimples(funcionario.dataNascimento) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>RG</th>
                          <td>{funcionario.rg || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Sexo</th>
                          <td>{obterDescricaoSexo(funcionario.sexo)}</td>
                        </tr>
                        <tr>
                          <th>Estado Civil</th>
                          <td>{obterDescricaoEstadoCivil(funcionario.estadoCivil)}</td>
                        </tr>
                        <tr>
                          <th>Nacionalidade</th>
                          <td>{obterDescricaoNacionalidade(funcionario.nacionalidade, funcionario.isBrasileiro)}</td>
                        </tr>
                        <tr>
                          <th>Telefone</th>
                          <td>{funcionario.telefone || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>{funcionario.email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Situação</th>
                          <td>
                            {funcionario.ativo ? (
                              <Badge color="success" className="rounded-pill px-3 py-2">Ativo</Badge>
                            ) : (
                              <Badge color="danger" className="rounded-pill px-3 py-2">Inativo</Badge>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Col>
              <Col md="6">
                <Card className="mb-4 border-0 shadow-sm">
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faIdCard} className="me-2" />
                      Dados Profissionais
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">Função</th>
                          <td>{funcionario.funcaoFuncionario?.funcaoFuncionarioNome || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Data de Admissão</th>
                          <td>{formatarDataSimples(funcionario.dataAdmissao) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Data de Demissão</th>
                          <td>{formatarDataSimples(funcionario.dataDemissao) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Salário</th>
                          <td>{funcionario.salario 
                              ? `R$ ${funcionario.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Observações</th>
                          <td>{funcionario.observacoes || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>

                <Card className="mb-4 border-0 shadow-sm">
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faAddressCard} className="me-2" />
                      Dados da CNH
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">Categoria da CNH</th>
                          <td>{funcionario.cnh || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Validade da CNH</th>
                          <td>{formatarDataSimples(funcionario.dataValidadeCNH) || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      Informações do Registro
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">Data de Criação</th>
                          <td>
                            {formatarData(funcionario.dataCriacao)}
                            <div className="small text-muted">
                              {funcionario.userCriacao || 'Sistema'}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th>Última Atualização</th>
                          <td>
                            {formatarData(funcionario.dataAlteracao)}
                            <div className="small text-muted">
                              {funcionario.userAtualizacao || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-light">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Endereço
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="6">
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">Logradouro</th>
                          <td>{funcionario.logradouro || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Número</th>
                          <td>{funcionario.numero || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Bairro</th>
                          <td>{funcionario.bairro || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Complemento</th>
                          <td>{funcionario.complemento || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md="6">
                    <Table borderless responsive>
                      <tbody>
                        <tr>
                          <th width="35%">CEP</th>
                          <td>{funcionario.cep || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Cidade</th>
                          <td>{funcionario.cidade?.nome || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Estado</th>
                          <td>{funcionario.cidade?.estado?.nome || funcionario.cidade?.estadoId || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>País</th>
                          <td>Brasil</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
    </>
  );
};

export default FuncionarioDetail;
