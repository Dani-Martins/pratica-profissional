import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, FormGroup, Label, Input, Button,
  Row, Col, Alert, Spinner, Table, InputGroup
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFileExport, faFilter, faChartLine, 
  faCalendarAlt, faDownload, faPrint 
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RelatorioService } from '../../api/services';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const RelatorioVendas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState({
    dataInicio: subDays(new Date(), 30),
    dataFim: new Date(),
    formaPagamentoId: '',
    clienteId: '',
    produtoId: ''
  });
  
  const [vendas, setVendas] = useState([]);
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    valorTotal: 0,
    ticketMedio: 0,
    produtosMaisVendidos: [],
    vendasPorDia: [],
    vendasPorFormaPagamento: []
  });
  
  // Dados para os gráficos
  const [vendasPorDiaChart, setVendasPorDiaChart] = useState({
    labels: [],
    datasets: [
      {
        label: 'Vendas',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  });
  
  const [vendasPorFormaPagamentoChart, setVendasPorFormaPagamentoChart] = useState({
    labels: [],
    datasets: [
      {
        label: 'Forma de Pagamento',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  });
  
  const [produtosMaisVendidosChart, setProdutosMaisVendidosChart] = useState({
    labels: [],
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: [],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  });
  
  // Carregar dados do relatório
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulação para desenvolvimento
        setTimeout(() => {
          // Dados de exemplo para vendas
          const dataVendas = [
            { id: 1, data: '2023-04-05', cliente: 'Cliente 1', valor: 159.90, formaPagamento: 'Cartão de Crédito' },
            { id: 2, data: '2023-04-08', cliente: 'Cliente 2', valor: 259.80, formaPagamento: 'PIX' },
            { id: 3, data: '2023-04-10', cliente: 'Cliente 3', valor: 99.99, formaPagamento: 'Dinheiro' },
            { id: 4, data: '2023-04-12', cliente: 'Cliente 1', valor: 357.50, formaPagamento: 'Cartão de Crédito' },
            { id: 5, data: '2023-04-15', cliente: 'Cliente 4', valor: 125.75, formaPagamento: 'Boleto' }
          ];
          
          setVendas(dataVendas);
          
          // Resumo dos dados
          const totalVendas = dataVendas.length;
          const valorTotal = dataVendas.reduce((sum, venda) => sum + venda.valor, 0);
          const ticketMedio = valorTotal / totalVendas;
          
          // Dados para produtos mais vendidos
          const produtosMaisVendidos = [
            { nome: 'Produto A', quantidade: 12 },
            { nome: 'Produto D', quantidade: 9 },
            { nome: 'Produto B', quantidade: 7 },
            { nome: 'Produto C', quantidade: 5 },
            { nome: 'Produto E', quantidade: 3 }
          ];
          
          // Dados para vendas por dia
          const vendasPorDia = [
            { data: '2023-04-05', total: 1 },
            { data: '2023-04-08', total: 1 },
            { data: '2023-04-10', total: 1 },
            { data: '2023-04-12', total: 1 },
            { data: '2023-04-15', total: 1 }
          ];
          
          // Dados para vendas por forma de pagamento
          const vendasPorFormaPagamento = [
            { formaPagamento: 'Cartão de Crédito', total: 2 },
            { formaPagamento: 'PIX', total: 1 },
            { formaPagamento: 'Dinheiro', total: 1 },
            { formaPagamento: 'Boleto', total: 1 }
          ];
          
          setResumo({
            totalVendas,
            valorTotal,
            ticketMedio,
            produtosMaisVendidos,
            vendasPorDia,
            vendasPorFormaPagamento
          });
          
          // Atualizar dados dos gráficos
          setVendasPorDiaChart({
            labels: vendasPorDia.map(item => item.data),
            datasets: [
              {
                label: 'Vendas por Dia',
                data: vendasPorDia.map(item => item.total),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          });
          
          setVendasPorFormaPagamentoChart({
            labels: vendasPorFormaPagamento.map(item => item.formaPagamento),
            datasets: [
              {
                label: 'Forma de Pagamento',
                data: vendasPorFormaPagamento.map(item => item.total),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
              }
            ]
          });
          
          setProdutosMaisVendidosChart({
            labels: produtosMaisVendidos.map(item => item.nome),
            datasets: [
              {
                label: 'Quantidade Vendida',
                data: produtosMaisVendidos.map(item => item.quantidade),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
              }
            ]
          });
          
          setLoading(false);
        }, 1000);
        
        // Descomente quando a API estiver pronta
        // const params = {
        //   dataInicio: format(filtro.dataInicio, 'yyyy-MM-dd'),
        //   dataFim: format(filtro.dataFim, 'yyyy-MM-dd'),
        //   formaPagamentoId: filtro.formaPagamentoId || undefined,
        //   clienteId: filtro.clienteId || undefined,
        //   produtoId: filtro.produtoId || undefined
        // };
        // const data = await RelatorioService.vendasPorPeriodo(params);
        // setVendas(data.vendas);
        // setResumo(data.resumo);
        // Atualizar dados dos gráficos...
        
      } catch (err) {
        setError('Erro ao carregar relatório: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filtro]);
  
  // Manipulador para alterações no filtro
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro({ ...filtro, [name]: value });
  };
  
  // Manipulador para filtrar
  const handleFiltrar = (e) => {
    e.preventDefault();
    // A consulta será refeita pelo useEffect quando filtro mudar
  };
  
  // Manipulador para períodos pré-definidos
  const handlePeriodoPredefinido = (periodo) => {
    switch (periodo) {
      case 'hoje':
        setFiltro({
          ...filtro,
          dataInicio: new Date(),
          dataFim: new Date()
        });
        break;
      case 'ontem':
        setFiltro({
          ...filtro,
          dataInicio: subDays(new Date(), 1),
          dataFim: subDays(new Date(), 1)
        });
        break;
      case 'semana':
        setFiltro({
          ...filtro,
          dataInicio: subDays(new Date(), 7),
          dataFim: new Date()
        });
        break;
      case 'mes':
        setFiltro({
          ...filtro,
          dataInicio: subMonths(new Date(), 1),
          dataFim: new Date()
        });
        break;
      default:
        break;
    }
  };
  
  return (
    <div>
      <h2>Relatório de Vendas</h2>
      <Card>
        <CardHeader>
          <h4>Filtros</h4>
        </CardHeader>
        <CardBody>
          <FormGroup>
            <Label for="dataInicio">Data Início</Label>
            <DatePicker
              selected={filtro.dataInicio}
              onChange={date => setFiltro({ ...filtro, dataInicio: date })}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              locale={ptBR}
            />
          </FormGroup>
          <FormGroup>
            <Label for="dataFim">Data Fim</Label>
            <DatePicker
              selected={filtro.dataFim}
              onChange={date => setFiltro({ ...filtro, dataFim: date })}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              locale={ptBR}
            />
          </FormGroup>
          <FormGroup>
            <Label for="formaPagamentoId">Forma de Pagamento</Label>
            <Input
              type="select"
              name="formaPagamentoId"
              id="formaPagamentoId"
              value={filtro.formaPagamentoId}
              onChange={handleFiltroChange}
            >
              <option value="">Todas</option>
              <option value="1">Cartão de Crédito</option>
              <option value="2">PIX</option>
              <option value="3">Dinheiro</option>
              <option value="4">Boleto</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="clienteId">Cliente</Label>
            <Input
              type="text"
              name="clienteId"
              id="clienteId"
              value={filtro.clienteId}
              onChange={handleFiltroChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="produtoId">Produto</Label>
            <Input
              type="text"
              name="produtoId"
              id="produtoId"
              value={filtro.produtoId}
              onChange={handleFiltroChange}
            />
          </FormGroup>
          <Button color="primary" onClick={handleFiltrar}>
            <FontAwesomeIcon icon={faSearch} /> Filtrar
          </Button>
        </CardBody>
      </Card>
      {loading && <Spinner color="primary" />}
      {error && <Alert color="danger">{error}</Alert>}
      {!loading && !error && (
        <div>
          <h4>Resumo</h4>
          <p>Total de Vendas: {resumo.totalVendas}</p>
          <p>Valor Total: R$ {resumo.valorTotal.toFixed(2)}</p>
          <p>Ticket Médio: R$ {resumo.ticketMedio.toFixed(2)}</p>
          <h4>Produtos Mais Vendidos</h4>
          <Table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {resumo.produtosMaisVendidos.map((produto, index) => (
                <tr key={index}>
                  <td>{produto.nome}</td>
                  <td>{produto.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h4>Vendas por Dia</h4>
          <Bar data={vendasPorDiaChart} />
          <h4>Vendas por Forma de Pagamento</h4>
          <Pie data={vendasPorFormaPagamentoChart} />
        </div>
      )}
    </div>
  );
};

export default RelatorioVendas;