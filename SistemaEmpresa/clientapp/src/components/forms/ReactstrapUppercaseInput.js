import React from 'react';
import { Input } from 'reactstrap';
import UppercaseInput from './UppercaseInput';

/**
 * Exemplo de como usar o componente UppercaseInput com os componentes do Reactstrap
 * 
 * Este é apenas um exemplo para demonstrar o uso do componente.
 * Na maioria dos casos, o CSS e o JavaScript global já farão a conversão 
 * para maiúsculas automaticamente.
 */
const ReactstrapUppercaseInput = (props) => {
  return (
    <UppercaseInput 
      component={Input} 
      {...props} 
    />
  );
};

export default ReactstrapUppercaseInput;
