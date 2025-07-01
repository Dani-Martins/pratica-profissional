import React from 'react';
import { Input } from 'reactstrap';

/**
 * Componente Input que automaticamente converte texto para maiúsculas
 * Exceção para campos de email, telefone, valores monetários, etc.
 */
const UppercaseInput = ({ onChange, name, type, id, ...props }) => {
  // Campos que devem permanecer com formatação original
  const preserveCaseFields = [
    'email', 'password', 'telefone', 'cpf', 'cnpj', 'cep', 
    'limiteCredito', 'salario', 'valor', 'preco', 'quantidade',
    'codigoTelefonico', 'codigo'
  ];
  
  // Verificar se é um campo que deve preservar a formatação
  const shouldPreserve = preserveCaseFields.some(field => 
    (name && name.toLowerCase().includes(field)) || 
    (id && id.toLowerCase().includes(field)) ||
    type === 'email' || 
    type === 'number' ||
    type === 'tel'
  );

  const handleChange = (e) => {
    if (shouldPreserve) {
      // Manter formatação original
      onChange && onChange(e);
    } else {
      // Aplicar transformação para maiúsculas
      const upperEvent = {
        ...e,
        target: {
          ...e.target,
          value: e.target.value.toUpperCase()
        }
      };
      onChange && onChange(upperEvent);
    }
  };

  return (
    <Input
      {...props}
      name={name}
      type={type}
      id={id}
      onChange={handleChange}
    />
  );
};

export default UppercaseInput;
