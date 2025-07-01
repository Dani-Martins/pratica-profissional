import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navbar, NavbarBrand, Nav, NavItem, NavLink, 
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Button
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faUser, faCog, 
  faSignOutAlt, faBell, faEnvelope 
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
    setShowSidebar(!showSidebar);
  };
  
  return (
    <Navbar color="white" light expand className="shadow-sm mb-3">
      <Button 
        color="light" 
        className="d-lg-none mr-2" 
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} />
      </Button>
      
      <NavbarBrand href="/">Sistema Empresa</NavbarBrand>
      
      <Nav className="ms-auto" navbar>
        <NavItem>
          <NavLink href="#">
            <FontAwesomeIcon icon={faBell} />
            <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">2</span>
          </NavLink>
        </NavItem>
        
        <NavItem>
          <NavLink href="#">
            <FontAwesomeIcon icon={faEnvelope} />
            <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">4</span>
          </NavLink>
        </NavItem>
        
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Usuário
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem>
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Perfil
            </DropdownItem>
            <DropdownItem>
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Configurações
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Sair
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  );
};

export default Header;