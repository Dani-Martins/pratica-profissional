import React, { useState, useEffect } from 'react';
import { Alert } from 'reactstrap';

const CustomAlert = ({ color, message, onDismiss, autoDismiss = true, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onDismiss, visible]);
  
  // Definir explicitamente o objeto timeout para o Fade dentro do Alert
  const fadeTimeout = {
    enter: 500,
    exit: 300
  };
  
  return (
    <Alert 
      color={color} 
      isOpen={visible} 
      toggle={() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }}
      fade={true}
      transition={{ timeout: fadeTimeout }} // Esta é a forma correta de passar o timeout para o Fade
    >
      {message}
    </Alert>
  );
};

export default CustomAlert;