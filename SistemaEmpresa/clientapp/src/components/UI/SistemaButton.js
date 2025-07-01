import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SistemaButton = ({ 
  children, 
  icon, 
  color = 'primary', 
  isLoading = false, 
  ...props 
}) => {
  return (
    <Button 
      color={color} 
      disabled={isLoading} 
      {...props}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm me-2" />
      ) : icon ? (
        <FontAwesomeIcon icon={icon} className="me-2" />
      ) : null}
      {children}
    </Button>
  );
};

export default SistemaButton;