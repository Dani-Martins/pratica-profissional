import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { 
  Navbar, 
  NavbarBrand, 
  Nav, 
  NavItem, 
  Button
} from 'reactstrap';
import { 
  FaTachometerAlt, 
  FaUserFriends, 
  FaBoxes, 
  FaFileInvoice, 
  FaMoneyBillWave, 
  FaChartBar,
  FaMapMarkedAlt, 
  FaGlobe, 
  FaMapMarker, 
  FaCity,
  FaTruck, 
  FaIdCard, 
  FaCarAlt,
  FaFileAlt, 
  FaReceipt, 
  FaCode,
  FaAngleDown,
  FaAngleRight,
  FaBell, 
  FaEnvelope, 
  FaUser
} from 'react-icons/fa';

const MainLayout = () => {
  const { refreshAll } = useDataContext();
  const location = useLocation();  const [openMenus, setOpenMenus] = useState({
    localizacao: location.pathname.startsWith('/localizacao'),
    financeiro: location.pathname.startsWith('/financeiro'),
    notasFiscais: location.pathname.startsWith('/notas-fiscais'),
    funcionarios: location.pathname.startsWith('/funcionarios')
  });
  
  // Ouvir eventos de alteração de dados
  useEffect(() => {
    const handleDataChange = () => {
      console.log('>>> MainLayout: Evento "dataChange" recebido. Chamando refreshAll...');
      refreshAll();
    };
    
    console.log('>>> MainLayout: Adicionando event listener para "dataChange"');
    window.addEventListener('dataChange', handleDataChange);
    
    return () => {
      console.log('>>> MainLayout: Removendo event listener para "dataChange"');
      window.removeEventListener('dataChange', handleDataChange);
    };
  }, [refreshAll]);

  useEffect(() => {
    console.log('>>> MainLayout: location mudou:', location.pathname, location.search, location.state);
  }, [location]);

  // Toggle menu - APENAS abre/fecha submenu SEM navegar
  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Verificar se a rota atual está ativa
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark">
        <div className="sidebar-header">
          <h3 className="text-white px-3 py-4 m-0">Sistema Empresa</h3>
        </div>
        
        <ul className="nav flex-column sidebar-nav">
          {/* Dashboard */}
          <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Link to="/" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaTachometerAlt className="me-3" />
              <span>Dashboard</span>
            </Link>
          </li>
          
          {/* Clientes */}
          <li className={`nav-item ${isActive('/clientes') ? 'active' : ''}`}>
            <Link to="/clientes" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaUserFriends className="me-3" />
              <span>Clientes</span>
            </Link>
          </li>
          
          {/* Produtos (com submenu) */}
          <li className={`nav-item ${isActive('/produtos') ? 'active' : ''}`}>
            <a 
              href="#"
              className="nav-link text-white d-flex align-items-center px-3 py-2"
              onClick={e => { e.preventDefault(); toggleMenu('produtos'); }}
            >
              <FaBoxes className="me-3" />
              <span>Produtos</span>
              <span className="ms-auto">
                {openMenus.produtos ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </a>
            {openMenus.produtos && (
              <ul className="nav flex-column sidebar-submenu">
                <li>
                  <Link to="/produtos" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${location.pathname === '/produtos' ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Produtos</span>
                  </Link>
                </li>
                <li>
                  <Link to="/produtos/unidademedida" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/produtos/unidademedida') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Unidades de Medida</span>
                  </Link>
                </li>
                <li>
                  <Link to="/produtos/marca" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/produtos/marca') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Marcas</span>
                  </Link>
                </li>
                <li>
                  <Link to="/produtos/categoria" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/produtos/categoria') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Categorias</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Vendas */}
          <li className={`nav-item ${isActive('/vendas') ? 'active' : ''}`}>
            <Link to="/vendas" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaFileInvoice className="me-3" />
              <span>Vendas</span>
            </Link>
          </li>
          
          {/* Financeiro (com submenu) */}
          <li className={`nav-item ${isActive('/financeiro') ? 'active' : ''}`}>
            <a 
              href="#"
              className="nav-link text-white d-flex align-items-center px-3 py-2"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu('financeiro');
              }}
            >
              <FaMoneyBillWave className="me-3" />
              <span>Financeiro</span>
              <span className="ms-auto">
                {openMenus.financeiro ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </a>
            {openMenus.financeiro && (
              <ul className="nav flex-column sidebar-submenu">
                <li>
                  <Link to="/financeiro/formas-pagamento" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/financeiro/formas-pagamento') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Formas de Pagamento</span>
                  </Link>
                </li>
                <li>
                  <Link to="/financeiro/condicoes-pagamento" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/financeiro/condicoes-pagamento') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Condições de Pagamento</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Relatórios */}
          <li className={`nav-item ${isActive('/relatorios') ? 'active' : ''}`}>
            <Link to="/relatorios/vendas" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaChartBar className="me-3" />
              <span>Relatórios</span>
            </Link>
          </li>
          
          {/* Localização (com submenu) - CORRIGIDO para não navegar ao clicar */}
          <li className={`nav-item ${isActive('/localizacao') ? 'active' : ''}`}>
            <a 
              href="#"
              className="nav-link text-white d-flex align-items-center px-3 py-2"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu('localizacao'); // Apenas alterna o estado do menu
              }}
            >
              <FaMapMarkedAlt className="me-3" />
              <span>Localização</span>
              <span className="ms-auto">
                {openMenus.localizacao ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </a>
            {openMenus.localizacao && (
              <ul className="nav flex-column sidebar-submenu">
                <li>
                  <Link to="/localizacao/paises" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/localizacao/paises') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Países</span>
                  </Link>
                </li>
                <li>
                  <Link to="/localizacao/estados" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/localizacao/estados') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Estados</span>
                  </Link>
                </li>
                <li>
                  <Link to="/localizacao/cidades" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/localizacao/cidades') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Cidades</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Fornecedores */}
          <li className={`nav-item ${isActive('/fornecedores') ? 'active' : ''}`}>
            <Link to="/fornecedores" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaTruck className="me-3" />
              <span>Fornecedores</span>
            </Link>
          </li>
            {/* Funcionários */}
          <li className={`nav-item ${isActive('/funcionarios') ? 'active' : ''}`}>
            <a 
              href="#"
              className="nav-link text-white d-flex align-items-center px-3 py-2"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu('funcionarios');
              }}
            >
              <FaIdCard className="me-3" />
              <span>Funcionários</span>
              <span className="ms-auto">
                {openMenus.funcionarios ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </a>
            {openMenus.funcionarios && (
              <ul className="nav flex-column sidebar-submenu">
                <li>
                  <Link to="/funcionarios" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${location.pathname === '/funcionarios' ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Funcionários</span>
                  </Link>
                </li>
                <li>
                  <Link to="/funcionarios/funcoes" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/funcionarios/funcoes') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Funções</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Transportadoras */}
          <li className={`nav-item ${isActive('/transportadoras') ? 'active' : ''}`}>
            <Link to="/transportadoras" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaTruck className="me-3" />
              <span>Transportadoras</span>
            </Link>
          </li>
          
          {/* Veículos */}
          <li className={`nav-item ${isActive('/veiculos') ? 'active' : ''}`}>
            <Link to="/veiculos" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaCarAlt className="me-3" />
              <span>Veículos</span>
            </Link>
          </li>
          
          {/* Notas Fiscais (com submenu) */}
          <li className={`nav-item ${isActive('/notas-fiscais') ? 'active' : ''}`}>
            <a 
              href="#"
              className="nav-link text-white d-flex align-items-center px-3 py-2"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu('notasFiscais'); // Apenas alterna o estado do menu
              }}
            >
              <FaFileAlt className="me-3" />
              <span>Notas Fiscais</span>
              <span className="ms-auto">
                {openMenus.notasFiscais ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </a>
            {openMenus.notasFiscais && (
              <ul className="nav flex-column sidebar-submenu">
                <li>
                  <Link to="/notas-fiscais" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${location.pathname === '/notas-fiscais' ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Listagem</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notas-fiscais/modalidades" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/notas-fiscais/modalidades') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Modalidades NFE</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notas-fiscais/status" className={`nav-link text-white d-flex align-items-center ps-5 py-2 ${isActive('/notas-fiscais/status') ? 'active' : ''}`}>
                    <span className="dot me-2"></span>
                    <span>Status NFE</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Teste API */}
          <li className={`nav-item ${isActive('/teste-api') ? 'active' : ''}`}>
            <Link to="/teste-api" className="nav-link text-white d-flex align-items-center px-3 py-2">
              <FaCode className="me-3" />
              <span>Teste de API</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Conteúdo principal */}
      <div className="main-content flex-grow-1">
        {/* Navbar superior */}
        <Navbar color="white" light className="border-bottom shadow-sm mb-4">
          <NavbarBrand className="ms-3">Sistema Empresa</NavbarBrand>
          <Nav className="ms-auto me-3 d-flex flex-row align-items-center" navbar>
            <NavItem className="mx-2 d-flex align-items-center">
              <Button color="link" className="nav-link p-1">
                <FaBell size={16} />
              </Button>
            </NavItem>
            <NavItem className="mx-2 d-flex align-items-center">
              <Button color="link" className="nav-link p-1">
                <FaEnvelope size={16} />
              </Button>
            </NavItem>
            <NavItem className="mx-2 d-flex align-items-center">
              <span className="me-2">Usuário</span>
              <FaUser size={16} />
            </NavItem>
          </Nav>
        </Navbar>

        {/* Conteúdo da página */}
        <div className="page-content px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;