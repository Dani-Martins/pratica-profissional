import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { MessageProvider } from './contexts/MessageContext';
import MainLayout from './layouts/MainLayout';
import './App.css';
import './styles/Table.css';
import './styles/Uppercase.css';
import './styles/TextCase.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';

// Clientes
import ClienteList from './pages/Clientes/ClienteList';
import ClienteForm from './pages/Clientes/ClienteForm';
import ClienteDetail from './pages/Clientes/ClienteDetail';

// Produtos
import ProdutoList from './pages/Produtos/ProdutoList';
import ProdutoForm from './pages/Produtos/ProdutoForm';
import ProdutoDetail from './pages/Produtos/ProdutoDetail';

// Unidade de Medida
import UnidadeMedidaList from './pages/Produtos/UnidadeMedida/UnidadeMedidaList';
import UnidadeMedidaForm from './pages/Produtos/UnidadeMedida/UnidadeMedidaForm';
import UnidadeMedidaDetail from './pages/Produtos/UnidadeMedida/UnidadeMedidaDetail';

// Vendas
import VendaList from './pages/Vendas/VendaList';
import VendaForm from './pages/Vendas/VendaForm';
import VendaDetail from './pages/Vendas/VendaDetail';

// Financeiro
import FormaPagamentoList from './pages/Financeiro/FormaPagamento/FormaPagamentoList';
import FormaPagamentoForm from './pages/Financeiro/FormaPagamento/FormaPagamentoForm';
import FormaPagamentoDetail from './pages/Financeiro/FormaPagamento/FormaPagamentoDetail';
import CondicaoPagamentoList from './pages/Financeiro/CondicaoPagamento/CondicaoPagamentoList';
import CondicaoPagamentoForm from './pages/Financeiro/CondicaoPagamento/CondicaoPagamentoForm';
import CondicaoPagamentoDetail from './pages/Financeiro/CondicaoPagamento/CondicaoPagamentoDetail';

// Testes
import TestEndpoint from './pages/TestEndpoint';

// Relatórios
import RelatorioVendas from './pages/Relatorios/RelatorioVendas';

// Localização
import CidadeList from './pages/Localizacao/Cidade/CidadeList';
import CidadeForm from './pages/Localizacao/Cidade/CidadeForm';
import CidadeDetails from './pages/Localizacao/Cidade/CidadeDetails';
import EstadoList from './pages/Localizacao/Estado/EstadoList';
import EstadoForm from './pages/Localizacao/Estado/EstadoForm';
import PaisList from './pages/Localizacao/Pais/PaisList';
import PaisForm from './pages/Localizacao/Pais/PaisForm';
import PaisDetails from './pages/Localizacao/Pais/PaisDetails';
import EstadoDetails from './pages/Localizacao/Estado/EstadoDetails';

// Fornecedores
import FornecedorList from './pages/Fornecedores/FornecedorList';
import FornecedorFormNew from './pages/Fornecedores/FornecedorFormNew';
import FornecedorDetail from './pages/Fornecedores/FornecedorDetail';

// Funcionários
import FuncionarioList from './pages/Funcionarios/FuncionarioList';
import FuncionarioForm from './pages/Funcionarios/FuncionarioForm';
import FuncionarioDetail from './pages/Funcionarios/FuncionarioDetail';
import FuncaoFuncionarioList from './pages/Funcionarios/Funcao/FuncaoFuncionarioList';
import FuncaoFuncionarioForm from './pages/Funcionarios/Funcao/FuncaoFuncionarioForm';
import FuncaoFuncionarioDetail from './pages/Funcionarios/Funcao/FuncaoFuncionarioDetail';

// Transportadoras
import TransportadoraList from './pages/Transportadoras/TransportadoraList';
import TransportadoraForm from './pages/Transportadoras/TransportadoraForm';

// Veículos
import VeiculoList from './pages/Veiculos/VeiculoList';
import VeiculoForm from './pages/Veiculos/VeiculoForm';

// Nota Fiscal
import NotaFiscalList from './pages/NotaFiscal/NotaFiscalList';
import NotaFiscalForm from './pages/NotaFiscal/NotaFiscalForm';

// Modalidade NFE
import ModalidadeNFEList from './pages/NotaFiscal/ModalidadeNFE/ModalidadeNFEList';
import ModalidadeNFEForm from './pages/NotaFiscal/ModalidadeNFE/ModalidadeNFEForm';

// Status NFE
import StatusNFEList from './pages/NotaFiscal/StatusNFE/StatusNFEList';
import StatusNFEForm from './pages/NotaFiscal/StatusNFE/StatusNFEForm';

// Teste API
import TesteAPI from './pages/TesteAPI';

// Api Test Page
import ApiTestPage from './pages/ApiTest/ApiTestPage';

// Marca
import MarcaList from './pages/Produtos/Marca/MarcaList';
import MarcaForm from './pages/Produtos/Marca/MarcaForm';
import MarcaDetail from './pages/Produtos/Marca/MarcaDetail';

// Categoria
import CategoriaList from './pages/Produtos/Categoria/CategoriaList';
import CategoriaForm from './pages/Produtos/Categoria/CategoriaForm';
import CategoriaDetail from './pages/Produtos/Categoria/CategoriaDetail';

function App() {
  return (
    <DataProvider>
      <Router>
        <MessageProvider>
          <Routes>
            {/* Rotas protegidas dentro do MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              
              {/* Clientes */}
              <Route path="/clientes" element={<ClienteList />} />
              <Route path="/clientes/novo" element={<ClienteForm />} />
              <Route path="/clientes/editar/:id" element={<ClienteForm />} />
              <Route path="/clientes/detalhes/:id" element={<ClienteDetail />} />
              
              {/* Produtos */}
              <Route path="produtos" element={<ProdutoList />} />
              <Route path="produtos/novo" element={<ProdutoForm />} />
              <Route path="produtos/editar/:id" element={<ProdutoForm />} />
              <Route path="produtos/detalhes/:id" element={<ProdutoDetail />} />

              {/* Unidade de Medida */}
              <Route path="produtos/unidademedida" element={<UnidadeMedidaList />} />
              <Route path="produtos/unidademedida/novo" element={<UnidadeMedidaForm />} />
              <Route path="produtos/unidademedida/editar/:id" element={<UnidadeMedidaForm />} />
              <Route path="produtos/unidademedida/detalhes/:id" element={<UnidadeMedidaDetail />} />
              
              {/* Vendas */}
              <Route path="vendas" element={<VendaList />} />
              <Route path="vendas/novo" element={<VendaForm />} />
              <Route path="vendas/editar/:id" element={<VendaForm />} />
              <Route path="vendas/detalhes/:id" element={<VendaDetail />} />
              
              {/* Financeiro */}
              <Route path="financeiro/formas-pagamento" element={<FormaPagamentoList />} />
              <Route path="financeiro/formas-pagamento/novo" element={<FormaPagamentoForm />} />
              <Route path="financeiro/formas-pagamento/editar/:id" element={<FormaPagamentoForm />} />
              <Route path="financeiro/formas-pagamento/detalhes/:id" element={<FormaPagamentoDetail />} />
              
              <Route path="financeiro/condicoes-pagamento" element={<CondicaoPagamentoList />} />
              <Route path="financeiro/condicoes-pagamento/novo" element={<CondicaoPagamentoForm />} />
              <Route path="financeiro/condicoes-pagamento/editar/:id" element={<CondicaoPagamentoForm />} />
              <Route path="financeiro/condicoes-pagamento/detalhes/:id" element={<CondicaoPagamentoDetail />} />
              
              {/* Relatórios */}
              <Route path="relatorios/vendas" element={<RelatorioVendas />} />
              
              {/* Localização */}
              <Route path="localizacao/paises" element={<PaisList />} />
              <Route path="localizacao/paises/novo" element={<PaisForm />} />
              <Route path="localizacao/paises/editar/:id" element={<PaisForm />} />
              <Route path="localizacao/paises/detalhes/:id" element={<PaisDetails />} />
              
              <Route path="localizacao/estados" element={<EstadoList />} />
              <Route path="localizacao/estados/novo" element={<EstadoForm />} />
              <Route path="localizacao/estados/editar/:id" element={<EstadoForm />} />
              <Route path="localizacao/estados/detalhes/:id" element={<EstadoDetails />} />
              
              <Route path="localizacao/cidades" element={<CidadeList />} />
              <Route path="localizacao/cidades/novo" element={<CidadeForm />} />
              <Route path="localizacao/cidades/editar/:id" element={<CidadeForm />} />
              <Route path="localizacao/cidades/detalhes/:id" element={<CidadeDetails />} />
              
              {/* Fornecedores */}
              <Route path="/fornecedores" element={<FornecedorList />} />
              <Route path="/fornecedores/novo" element={<FornecedorFormNew />} />
              <Route path="/fornecedores/editar/:id" element={<FornecedorFormNew />} />
              <Route path="/fornecedores/detalhes/:id" element={<FornecedorDetail />} />

              {/* Funcionários */}
              <Route path="/funcionarios" element={<FuncionarioList />} />
              <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
              <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />
              <Route path="/funcionarios/detalhes/:id" element={<FuncionarioDetail />} />
              
              {/* Funções de Funcionários */}
              <Route path="/funcionarios/funcoes" element={<FuncaoFuncionarioList />} />
              <Route path="/funcionarios/funcoes/nova" element={<FuncaoFuncionarioForm />} />
              <Route path="/funcionarios/funcoes/editar/:id" element={<FuncaoFuncionarioForm />} />
              <Route path="/funcionarios/funcoes/detalhes/:id" element={<FuncaoFuncionarioDetail />} />
              
              {/* Testes */}
              <Route path="/teste-endpoint" element={<TestEndpoint />} />
              
              {/* Transportadoras */}
              <Route path="transportadoras" element={<TransportadoraList />} />
              <Route path="transportadoras/novo" element={<TransportadoraForm />} />
              <Route path="transportadoras/editar/:id" element={<TransportadoraForm />} />
              
              {/* Veículos */}
              <Route path="veiculos" element={<VeiculoList />} />
              <Route path="veiculos/novo" element={<VeiculoForm />} />
              <Route path="veiculos/editar/:id" element={<VeiculoForm />} />
              
              {/* Notas Fiscais */}
              <Route path="notas-fiscais" element={<NotaFiscalList />} />
              <Route path="notas-fiscais/novo" element={<NotaFiscalForm />} />
              <Route path="notas-fiscais/editar/:id" element={<NotaFiscalForm />} />
              
              {/* Modalidade NFE */}
              <Route path="notas-fiscais/modalidades" element={<ModalidadeNFEList />} />
              <Route path="notas-fiscais/modalidades/novo" element={<ModalidadeNFEForm />} />
              <Route path="notas-fiscais/modalidades/editar/:id" element={<ModalidadeNFEForm />} />
              
              {/* Status NFE */}
              <Route path="notas-fiscais/status" element={<StatusNFEList />} />
              <Route path="notas-fiscais/status/novo" element={<StatusNFEForm />} />
              <Route path="notas-fiscais/status/editar/:id" element={<StatusNFEForm />} />
              
              {/* Teste API */}
              <Route path="teste-api" element={<TesteAPI />} />
              <Route path="api-test" element={<ApiTestPage />} />
              
              {/* Marca */}
              <Route path="/produtos/marca" element={<MarcaList />} />
              <Route path="/produtos/marca/novo" element={<MarcaForm />} />
              <Route path="/produtos/marca/editar/:id" element={<MarcaForm />} />
              <Route path="/produtos/marca/detalhes/:id" element={<MarcaDetail />} />
              {/* Categoria */}
              <Route path="/produtos/categoria" element={<CategoriaList />} />
              <Route path="/produtos/categoria/novo" element={<CategoriaForm />} />
              <Route path="/produtos/categoria/editar/:id" element={<CategoriaForm />} />
              <Route path="/produtos/categoria/detalhes/:id" element={<CategoriaDetail />} />
              
              {/* Rota padrão para páginas não encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MessageProvider>
      </Router>
    </DataProvider>
  );
}

export default App;
