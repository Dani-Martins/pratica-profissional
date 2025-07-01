import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardHeader, Spinner, Alert } from 'reactstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { FaGlobe, FaMapMarkerAlt, FaCity, FaUserFriends, FaBoxes, FaFileInvoice, FaTruck, FaIdCard, FaSync } from 'react-icons/fa';
import apiClient from '../../api/client';
import { createApiService } from '../../api/servicesFactory';

// Registrar componentes Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Serviços API
const paisesService = createApiService('paises');
const estadosService = createApiService('estados');
const cidadesService = createApiService('cidades');
const clientesService = createApiService('clientes');
const produtosService = createApiService('produtos');
const notasFiscaisService = createApiService('notasfiscais');
const fornecedoresService = createApiService('fornecedores');
const funcionariosService = createApiService('funcionarios');

// Intervalo de atualização em milissegundos (10 segundos)
const UPDATE_INTERVAL = 10000;

const Dashboard = () => {
  // Estados para armazenar as contagens - inicializar com zeros
  const [paisesCount, setPaisesCount] = useState(0);
  const [estadosCount, setEstadosCount] = useState(0);
  const [cidadesCount, setCidadesCount] = useState(0);
  const [clientesCount, setClientesCount] = useState(0);
  const [produtosCount, setProdutosCount] = useState(0);
  const [notasFiscaisCount, setNotasFiscaisCount] = useState(0);
  const [fornecedoresCount, setFornecedoresCount] = useState(0);
  const [funcionariosCount, setFuncionariosCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Referência para o intervalo de atualização
  const intervalRef = useRef(null);

  // Função para buscar os dados do servidor
  const fetchData = async () => {
    try {
      setError(null);
      console.log("Buscando dados do dashboard...");

      // Carregar dados usando apiClient direto
      try {
        const response = await apiClient.get('/api/Pais');
        console.log("Resposta da API de países:", response);
        
        if (response && response.data) {
          const paises = response.data;
          const paisesLength = Array.isArray(paises) ? paises.length : 0;
          console.log(`Contagem de países: ${paisesLength}`);
          setPaisesCount(paisesLength);
        }
      } catch (error) {
        console.error('Erro ao carregar países:', error);
        setError("Erro ao carregar dados de países.");
      }

      try {
        const response = await apiClient.get('/api/Estado');
        console.log("Resposta da API de estados:", response);
        
        if (response && response.data) {
          const estados = response.data;
          const estadosLength = Array.isArray(estados) ? estados.length : 0;
          console.log(`Contagem de estados: ${estadosLength}`);
          setEstadosCount(estadosLength);
        }
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        setError(prev => prev ? prev : "Erro ao carregar dados de estados.");
      }

      try {
        const response = await apiClient.get('/api/Cidade');
        if (response && response.data) {
          const cidades = response.data;
          const cidadesLength = Array.isArray(cidades) ? cidades.length : 0;
          console.log(`Contagem de cidades: ${cidadesLength}`);
          setCidadesCount(cidadesLength);
        }
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setError(prev => prev ? prev : "Erro ao carregar dados de cidades.");
      }

      try {
        const response = await apiClient.get('/api/Cliente');
        if (response && response.data) {
          const clientes = response.data;
          setClientesCount(Array.isArray(clientes) ? clientes.length : 0);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setError(prev => prev ? prev : "Erro ao carregar dados de clientes.");
      }

      // Outros recursos - apenas se existirem no backend
      try {
        const response = await apiClient.get('/api/Produto');
        if (response && response.data) {
          const produtos = response.data;
          setProdutosCount(Array.isArray(produtos) ? produtos.length : 0);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos - pode não existir ainda no backend:', error);
        // Não definir erro aqui, já que produtos pode não estar implementado ainda
      }

      try {
        const response = await apiClient.get('/api/NotaFiscal');
        if (response && response.data) {
          const notasFiscais = response.data;
          setNotasFiscaisCount(Array.isArray(notasFiscais) ? notasFiscais.length : 0);
        }
      } catch (error) {
        console.error('Erro ao carregar notas fiscais - pode não existir ainda no backend:', error);
      }

      try {
        const response = await apiClient.get('/api/Fornecedor');
        if (response && response.data) {
          const fornecedores = response.data;
          setFornecedoresCount(Array.isArray(fornecedores) ? fornecedores.length : 0);
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores - pode não existir ainda no backend:', error);
      }

      try {
        const response = await apiClient.get('/api/Funcionario');
        if (response && response.data) {
          const funcionarios = response.data;
          setFuncionariosCount(Array.isArray(funcionarios) ? funcionarios.length : 0);
        }
      } catch (error) {
        console.error('Erro ao carregar funcionários - pode não existir ainda no backend:', error);
      }

      // Registrar o horário da última atualização
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro geral ao carregar dados do dashboard:', error);
      setError("Erro ao carregar os dados do dashboard. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para iniciar o carregamento e a atualização automática
  useEffect(() => {
    // Carregar dados inicialmente
    fetchData();
    
    // Configurar atualização automática
    intervalRef.current = setInterval(() => {
      fetchData();
    }, UPDATE_INTERVAL);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Garantir que os gráficos recebam números válidos, mesmo que zeros
  const safePaisesCount = isNaN(paisesCount) ? 0 : paisesCount;
  const safeEstadosCount = isNaN(estadosCount) ? 0 : estadosCount;
  const safeCidadesCount = isNaN(cidadesCount) ? 0 : cidadesCount;

  // Verificar se há dados suficientes para renderizar gráficos
  const hasLocationData = safePaisesCount > 0 || safeEstadosCount > 0 || safeCidadesCount > 0;

  // Dados para o gráfico de linha de Visão Geral - só com dados reais
  const visaoGeralData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Clientes',
        data: [0, 0, 0, 0, 0, clientesCount], // Apenas o valor atual real no último mês
        fill: false,
        borderColor: 'rgba(78, 115, 223, 1)',
        tension: 0.1
      },
      {
        label: 'Vendas',
        data: [0, 0, 0, 0, 0, notasFiscaisCount], // Apenas o valor atual real no último mês
        fill: false,
        borderColor: 'rgba(28, 200, 138, 1)',
        tension: 0.1
      }
    ],
  };

  // Dados para o gráfico de rosca da localização - apenas dados reais
  const localizacaoData = {
    labels: ['Países', 'Estados', 'Cidades'],
    datasets: [
      {
        data: [safePaisesCount, safeEstadosCount, safeCidadesCount],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      }
    }
  };

  const lineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Verificar se há países cadastrados para configuração inicial
  const paisesConcluido = safePaisesCount > 0;
  const estadosConcluidos = safeEstadosCount > 0;
  const cidadesConcluidas = safeCidadesCount > 0;
  const clientesConcluidos = clientesCount > 0;
  
  return (
    <div className="dashboard">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Mensagem de erro caso haja algum problema */}
      {error && (
        <Alert color="warning" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Indicador de última atualização */}
      {lastUpdate && (
        <div className="text-muted small mb-3 d-flex align-items-center">
          <FaSync className="me-1" /> 
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
      
      {/* Primeira linha - Cards de contagem de localização */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-left-primary shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-primary text-uppercase mb-1">PAÍSES</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : safePaisesCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaGlobe size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-success shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-success text-uppercase mb-1">ESTADOS</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : safeEstadosCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaMapMarkerAlt size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-info shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-info text-uppercase mb-1">CIDADES</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : safeCidadesCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaCity size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-warning shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-warning text-uppercase mb-1">CLIENTES</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : clientesCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaUserFriends size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Segunda linha - Gráficos */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow mb-4">
            <CardHeader className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Visão Geral</h6>
              <div className="text-muted small">Este Ano</div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
                  <Spinner />
                </div>
              ) : (
                <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                  <Line data={visaoGeralData} options={lineOptions} />
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow mb-4">
            <CardHeader className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Localização</h6>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
                  <Spinner />
                </div>
              ) : hasLocationData ? (
                <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                  <Doughnut data={localizacaoData} options={options} />
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center text-muted" style={{height: '300px'}}>
                  Nenhum dado de localização disponível
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Terceira linha - Cards adicionais */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-left-danger shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-danger text-uppercase mb-1">PRODUTOS</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : produtosCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaBoxes size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-secondary shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-secondary text-uppercase mb-1">NOTAS FISCAIS</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : notasFiscaisCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaFileInvoice size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-success shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-success text-uppercase mb-1">FORNECEDORES</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : fornecedoresCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaTruck size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-warning shadow h-100">
            <CardBody className="d-flex flex-row align-items-center justify-content-between">
              <div>
                <CardTitle tag="h6" className="text-warning text-uppercase mb-1">FUNCIONÁRIOS</CardTitle>
                <div className="h2 mb-0 font-weight-bold">
                  {isLoading ? <Spinner size="sm" /> : funcionariosCount}
                </div>
              </div>
              <div className="icon text-secondary">
                <FaIdCard size={32} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Quarta linha - Configuração Inicial */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow">
            <CardHeader className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Configuração Inicial</h6>
            </CardHeader>
            <CardBody>
              <p>Para configurar seu sistema, siga estes passos:</p>
              <ol className="mb-0">
                <li className="mb-2">
                  Cadastre os países{' '}
                  {paisesConcluido && <span className="badge bg-success">Concluído</span>}
                </li>
                <li className="mb-2">
                  Cadastre os estados{' '}
                  {estadosConcluidos && <span className="badge bg-success">Concluído</span>}
                </li>
                <li className="mb-2">
                  Cadastre as cidades{' '}
                  {cidadesConcluidas && <span className="badge bg-success">Concluído</span>}
                </li>
                <li>
                  Cadastre seus clientes{' '}
                  {clientesConcluidos && <span className="badge bg-success">Concluído</span>}
                </li>
              </ol>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;