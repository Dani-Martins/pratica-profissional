import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthService from '../../api/services/authService';

export const RequireAuth = () => {
  const location = useLocation();
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirecionar para login mantendo a URL que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};