import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente auxiliar que converte automaticamente texto digitado em maiúsculas
 * para qualquer input ou componente que receba uma prop value e onChange
 */
const UppercaseInput = ({ component: Component, onChange, value, ...props }) => {
  // Função que converte o valor para maiúsculas durante a digitação
  const handleChange = (e) => {
    // Se for um evento normal com target.value
    if (e && e.target && e.target.value !== undefined) {
      // Clona o evento para evitar problemas com o React
      const newEvent = { ...e };
      newEvent.target = { ...e.target };
      
      // Converte o valor para maiúsculas
      newEvent.target.value = e.target.value.toUpperCase();
      
      // Chama o onChange original com o novo evento
      onChange(newEvent);
    } else {
      // Se for uma chamada direta de onChange com um valor
      const upperValue = typeof e === 'string' ? e.toUpperCase() : e;
      onChange(upperValue);
    }
  };
  
  // Converte o valor atual para maiúsculas se for uma string
  const upperValue = typeof value === 'string' ? value.toUpperCase() : value;
  
  return (
    <Component 
      {...props} 
      value={upperValue} 
      onChange={handleChange} 
    />
  );
};

UppercaseInput.propTypes = {
  component: PropTypes.elementType.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any
};

export default UppercaseInput;
