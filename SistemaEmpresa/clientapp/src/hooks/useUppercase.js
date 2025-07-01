import { useCallback } from 'react';

/**
 * Hook personalizado para aplicar transformação automática em maiúsculas
 * nos campos do formulário
 */
const useUppercase = (setFieldValue) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Campos que devem permanecer com formatação original
    const preserveCaseFields = [
      'email', 'password', 'telefone', 'cpf', 'cnpj', 'cep', 
      'limiteCredito', 'salario', 'valor', 'preco', 'quantidade',
      'codigoTelefonico', 'codigo'
    ];
    
    // Verificar se é um campo que deve preservar a formatação
    const shouldPreserve = preserveCaseFields.some(field => 
      name.toLowerCase().includes(field) || 
      e.target.type === 'email' || 
      e.target.type === 'number' ||
      e.target.type === 'tel' ||
      e.target.id.toLowerCase().includes(field)
    );
    
    if (shouldPreserve) {
      setFieldValue(name, value);
    } else {
      // Aplicar transformação para maiúsculas
      setFieldValue(name, value.toUpperCase());
    }
  }, [setFieldValue]);

  return { handleChange };
};

export default useUppercase;
