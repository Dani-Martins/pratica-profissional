import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';T
import { Container } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MainLayout = () => {
  return (
    <div className="d-flex">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      
      <div className="content-wrapper w-100">
        <Header />
        
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default MainLayout;