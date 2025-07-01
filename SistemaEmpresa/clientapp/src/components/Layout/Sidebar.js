import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Collapse } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faUsers, faBoxes, faShoppingCart,
  faMoneyBillWave, faChartBar, faMapMarkerAlt, faBuilding,
  faUserTie, faTruck, faCar, faFileInvoice, faList,
  faCircle, faAngleDown, faAngleRight, faCity, faFlag, faCode
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const MenuItem = ({ title, icon, to, active, children }) => {
  // Abre o submenu automaticamente se estiver ativo
  const [open, setOpen] = useState(active);
  const hasChildren = Array.isArray(children) && children.length > 0;
  
  // Atualiza o estado open quando a prop active mudar
  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
  
  return (
    <div className="sidebar-item">
      {hasChildren ? (
        <>
          <div 
            className={`nav-link d-flex justify-content-between align-items-center ${active ? 'active' : ''}`}
            onClick={() => setOpen(!open)}
          >
            <span>
              <FontAwesomeIcon icon={icon} className="me-2" /> {title}
            </span>
            <FontAwesomeIcon icon={open ? faAngleDown : faAngleRight} />
          </div>
          <Collapse isOpen={open}>
            <div className="submenu">
              {children}
            </div>
          </Collapse>
        </>
      ) : (
        <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>
          <FontAwesomeIcon icon={icon} className="me-2" /> {title}
        </Link>
      )}
    </div>
  );
};

const SubMenuItem = ({ title, to, active }) => {
  return (
    <Link to={to} className={`nav-link ps-4 ${active ? 'active' : ''}`}>
      <FontAwesomeIcon icon={faCircle} className="me-2" size="xs" /> {title}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="sidebar bg-dark">
      <div className="p-3 text-center">
        <h4 className="text-white">Sistema Empresa</h4>
      </div>
      
      <div className="sidebar-nav">
        <MenuItem 
          title="Dashboard" 
          icon={faTachometerAlt} 
          to="/" 
          active={path === '/'}
        />
        
        <MenuItem 
          title="Clientes" 
          icon={faUsers} 
          to="/clientes" 
          active={path.startsWith('/clientes')}
        />
        
        <MenuItem 
          title="Produtos" 
          icon={faBoxes} 
          to="#" 
          active={path.startsWith('/produtos')}
        >
          <div style={{color: 'red', fontWeight: 'bold'}}>TESTE ÚNICO</div>
        </MenuItem>
        
        <MenuItem 
          title="Vendas" 
          icon={faShoppingCart} 
          to="#" 
          active={path.startsWith('/vendas')}
        >
          <SubMenuItem 
            title="Lista de Vendas" 
            to="/vendas" 
            active={path === '/vendas'}
          />
          <SubMenuItem 
            title="Nova Venda" 
            to="/vendas/nova" 
            active={path === '/vendas/nova'}
          />
        </MenuItem>
        
        <MenuItem 
          title="Financeiro" 
          icon={faMoneyBillWave} 
          to="#" 
          active={path.startsWith('/financeiro')}
        >
          <SubMenuItem 
            title="Formas de Pagamento" 
            to="/financeiro/formas-pagamento" 
            active={path.startsWith('/financeiro/formas-pagamento')}
          />
          <SubMenuItem 
            title="Condições de Pagamento" 
            to="/financeiro/condicoes-pagamento" 
            active={path.startsWith('/financeiro/condicoes-pagamento')}
          />
          <SubMenuItem 
            title="Contas a Receber" 
            to="/financeiro/contas-receber" 
            active={path.startsWith('/financeiro/contas-receber')}
          />
        </MenuItem>
        
        <MenuItem 
          title="Relatórios" 
          icon={faChartBar} 
          to="#" 
          active={path.startsWith('/relatorios')}
        >
          <SubMenuItem 
            title="Vendas" 
            to="/relatorios/vendas" 
            active={path === '/relatorios/vendas'}
          />
          <SubMenuItem 
            title="Financeiro" 
            to="/relatorios/financeiro" 
            active={path === '/relatorios/financeiro'}
          />
        </MenuItem>
        
        <MenuItem 
          title="Localização" 
          icon={faMapMarkerAlt} 
          to="#" 
          active={path.startsWith('/localizacao')}
        >
          <SubMenuItem 
            title="Países" 
            to="/localizacao/paises" 
            active={path.startsWith('/localizacao/paises')}
          />
          <SubMenuItem 
            title="Estados" 
            to="/localizacao/estados" 
            active={path.startsWith('/localizacao/estados')}
          />
          <SubMenuItem 
            title="Cidades" 
            to="/localizacao/cidades" 
            active={path.startsWith('/localizacao/cidades')}
          />
        </MenuItem>
        
        <MenuItem 
          title="Fornecedores" 
          icon={faBuilding} 
          to="/fornecedores" 
          active={path.startsWith('/fornecedores')}
        />
        
        <MenuItem 
          title="Funcionários" 
          icon={faUserTie} 
          to="/funcionarios" 
          active={path.startsWith('/funcionarios')}
        />
        
        <MenuItem 
          title="Transportadoras" 
          icon={faTruck} 
          to="/transportadoras" 
          active={path.startsWith('/transportadoras')}
        />
        
        <MenuItem 
          title="Veículos" 
          icon={faCar} 
          to="/veiculos" 
          active={path.startsWith('/veiculos')}
        />
        
        <MenuItem 
          title="Notas Fiscais" 
          icon={faFileInvoice} 
          to="/notas-fiscais" 
          active={path.startsWith('/notas-fiscais')}
        />
        
        <MenuItem 
          title="Modalidades de NF-e" 
          icon={faList} 
          to="/modalidades-nfe" 
          active={path.startsWith('/modalidades-nfe')}
        />
        
        <MenuItem 
          title="Teste de API" 
          icon={faCode} 
          to="/api-test" 
          active={path.startsWith('/api-test')}
        />
        
      </div>
    </div>
  );
};

export default Sidebar;