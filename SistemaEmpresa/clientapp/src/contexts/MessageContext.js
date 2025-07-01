import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'reactstrap';

const MessageContext = createContext();

export const useMessages = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  // Adicionar um alerta que desaparece após timeout
  const addAlert = (type, message, timeout = 5000) => {
    // Usar um timestamp com um valor aleatório para garantir unicidade
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Verificar se já existe um alerta com a mesma mensagem para evitar duplicação
    const messageExists = alerts.some(alert => alert.message === message && alert.type === type);
    
    if (!messageExists) {
      setAlerts(prev => [...prev, { id, type, message }]);
      
      if (timeout) {
        setTimeout(() => {
          setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, timeout);
      }
    }
  };

  // Atalhos para tipos específicos de alerta
  const showSuccess = (message, timeout = 5000) => addAlert('success', message, timeout);
  const showError = (message, timeout = 5000) => addAlert('danger', message, timeout);
  const showWarning = (message, timeout = 5000) => addAlert('warning', message, timeout);
  const showInfo = (message, timeout = 5000) => addAlert('info', message, timeout);
  // Componente para renderizar todos os alertas
  const AlertContainer = () => {
    if (alerts.length === 0) return null;

    return (
      <div className="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1050 }}>
        {alerts.map(alert => (
          <Alert 
            key={alert.id} 
            color={alert.type} 
            className="mb-2" 
            isOpen={true}
            toggle={() => {
              setAlerts(prev => prev.filter(a => a.id !== alert.id));
            }}
          >
            {alert.message}
          </Alert>
        ))}
      </div>
    );
  };

  return (
    <MessageContext.Provider 
      value={{ 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo
      }}
    >
      {children}
      <AlertContainer />
    </MessageContext.Provider>
  );
};