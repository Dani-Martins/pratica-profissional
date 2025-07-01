/**
 * Utilitário para transformar texto em maiúsculas em elementos de formulário
 * 
 * Este script seleciona todos os campos de entrada de texto no sistema
 * e adiciona event listeners para transformar o texto digitado em maiúsculas
 * durante a digitação, garantindo que qualquer texto inserido seja armazenado
 * em maiúsculas.
 */

// Exportamos função para marcar elementos do Formik (pode ser importada em componentes React)
export const markFormikFields = (formElement) => {
  if (!formElement) return;
  
  // Marcar o formulário
  formElement.setAttribute('data-formik-form', 'true');
  
  // Marcar todos os inputs dentro do formulário
  const inputs = formElement.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.setAttribute('data-formik-input', 'true');
  });
};

// Função para transformar texto em maiúsculas (útil para formik e outros frameworks)
// Pode ser usada em onChange, onBlur ou para transformar valores antes de enviar
export const transformToUpperCase = (text) => {
  if (text && typeof text === 'string') {
    return text.toUpperCase();
  }
  return text;
};

// Função versátil para transformar campos para maiúsculas
export const handleUpperCaseChange = (fieldNameOrEvent, valueOrSetFieldValue, setFieldValue) => {
  // Campos que devem permanecer com formatação original
  const preserveCaseFields = [
    'email', 'password', 'telefone', 'cpf', 'cnpj', 'cep', 
    'limiteCredito', 'salario', 'valor', 'preco', 'quantidade',
    'codigo', 'url', 'site'
  ];

  // Uso 1: handleUpperCaseChange(fieldName, value) - para formulários simples
  if (typeof fieldNameOrEvent === 'string' && typeof valueOrSetFieldValue === 'string') {
    const fieldName = fieldNameOrEvent;
    const value = valueOrSetFieldValue;
    
    // Verificar se é um campo que deve preservar a formatação
    const shouldPreserve = preserveCaseFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
    
    return shouldPreserve ? value : (value ? value.toUpperCase() : value);
  }
  
  // Uso 2: handleUpperCaseChange(event, setFieldValue) - para Formik
  if (fieldNameOrEvent && fieldNameOrEvent.target && typeof valueOrSetFieldValue === 'function') {
    const e = fieldNameOrEvent;
    const setFieldValueFunc = valueOrSetFieldValue;
    const { name, value, type } = e.target;
    
    // Verificar se é um campo que deve preservar a formatação
    const shouldPreserve = preserveCaseFields.some(field => 
      name.toLowerCase().includes(field) || 
      type === 'email' || 
      type === 'number' ||
      e.target.id.toLowerCase().includes(field)
    );
    
    if (shouldPreserve) {
      setFieldValueFunc(name, value);
      return;
    }
    
    // Aplicar transformação para maiúsculas
    setFieldValueFunc(name, value ? value.toUpperCase() : value);
    return;
  }
  
  // Fallback: retornar o valor como está
  return fieldNameOrEvent;
};

// Função para ser executada quando o DOM for carregado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Iniciando utilitário de texto em maiúsculas para campos de entrada...');
  
  // Função para transformar o valor de um elemento em maiúsculas
  const transformToUppercase = (element) => {
    if (element.value && typeof element.value === 'string') {
      // Sempre ignorar campos de email
      const elementType = element.getAttribute('type');
      const elementId = element.getAttribute('id');
      const elementName = element.getAttribute('name');
      
      // Verificar se é um campo de email por tipo, id ou nome
      if (elementType === 'email' || 
         (elementId && elementId.toLowerCase().includes('email')) ||
         (elementName && elementName.toLowerCase().includes('email'))) {
        return; // Não processar campos de email
      }
      
      // Verificar se o elemento é controlado pelo React/Formik
      if (isFormikOrReactInput(element)) {
        return; // Não processar campos controlados
      }
      
      try {
        // Preserva a posição do cursor
        const start = element.selectionStart;
        const end = element.selectionEnd;
        
        // Transforma o texto em maiúsculas
        element.value = element.value.toUpperCase();
        
        // Restaura a posição do cursor
        if (typeof element.setSelectionRange === 'function') {
          element.setSelectionRange(start, end);
        }
      } catch (error) {
        console.warn('Erro ao aplicar transformação para maiúsculas:', error);
        // Apenas transforma o texto sem manipular a seleção
        element.value = element.value.toUpperCase();
      }
    }
  };
  
  // Função para verificar se um elemento é parte de um formulário Formik/React
  const isFormikOrReactInput = (element) => {
    // Verificar atributos explícitos
    if (element.hasAttribute('data-formik-input') || element.hasAttribute('data-react-input')) {
      return true;
    }
    
    // Verificar se está dentro de um formulário Formik
    let parent = element.parentElement;
    while (parent) {
      if (parent.hasAttribute('data-formik-form') || 
          parent.className && (
            parent.className.includes('formik') || 
            parent.className.includes('Formik')
          )) {
        return true;
      }
      parent = parent.parentElement;
    }

    // Verificar se o campo tem props React associados
    if (element._reactProps || element.__reactProps || 
        element._reactInternalInstance || element._reactEventHandlers) {
      return true;
    }
    
    // Verificar se é um campo associado ao React por convenção de nomenclatura
    if (element.id && (
        element.id.startsWith('formik-') || 
        element.id.startsWith('react-') || 
        element.id.startsWith('Field-')
       )) {
      return true;
    }
    
    // Verificar se o elemento tem um componente React associado usando os atributos do DOM
    for (const key in element) {
      if (key.startsWith('__react') || key.startsWith('_react')) {
        return true;
      }
    }
    
    // Verificar se o elemento possui o atributo value controlado pelo React/Formik
    if (element.getAttribute('value') !== null && element.value !== element.getAttribute('value')) {
      return true;
    }
    
    return false;
  };
  
  // Função para aplicar o transformador a todos os campos de entrada
  const applyUppercaseTransformer = () => {
    // Seleciona apenas os inputs de texto, textarea e select (excluindo checkbox, radio, file, email, etc)
    const allInputs = document.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), textarea');
    
    // Filtra inputs para excluir campos de email e campos controlados pelo React/Formik
    const textInputs = Array.from(allInputs).filter(input => {
      // Exclui campos de e-mail
      if (input.type === 'email' || 
          input.id && input.id.toLowerCase().includes('email') ||
          input.name && input.name.toLowerCase().includes('email')) {
        return false;
      }
      
      // Exclui campos controlados pelo Formik ou React
      if (isFormikOrReactInput(input)) {
        return false;
      }
      
      // Exclui se o input tem outras classes que indicam framework
      if (input.className && (
          input.className.includes('formik') || 
          input.className.includes('field') ||
          input.className.includes('react-')
         )) {
        return false;
      }
      
      return true;
    });
    
    textInputs.forEach(input => {
      // Transforma o valor atual
      transformToUppercase(input);
      
      // Remove event listeners existentes para evitar duplicação
      input.removeEventListener('input', function() { transformToUppercase(this); });
      
      // Adiciona o event listener para transformar o texto durante a digitação
      input.addEventListener('input', function() { transformToUppercase(this); });
    });
  };
  
  // Aplica imediatamente
  applyUppercaseTransformer();
  
  // Aplica novamente a cada 2 segundos para pegar elementos que são adicionados dinamicamente
  // MAS APENAS aos elementos que NÃO são de formulários controlados
  const timerInterval = setInterval(() => {
    applyUppercaseTransformer();
  }, 2000);
  
  // Limpa o intervalo quando a página for descarregada
  window.addEventListener('beforeunload', () => {
    clearInterval(timerInterval);
  });
  
  // Também aplica quando uma rota muda (para SPA)
  if (window.addEventListener) {
    window.addEventListener('hashchange', applyUppercaseTransformer);
    window.addEventListener('popstate', applyUppercaseTransformer);
  }
  
  // Para suportar React e outros frameworks que podem adicionar elementos depois
  // Observe mutations no DOM para detectar novos elementos
  const observer = new MutationObserver(function(mutations) {
    // Verificar se alguma mutação adicionou novos elementos de texto
    let shouldApply = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar se o elemento adicionado ou seus filhos contém inputs de texto
            const hasTextInputs = node.querySelectorAll && node.querySelectorAll('input[type="text"], textarea').length > 0;
            
            // Verificar se o próprio nó é um input de texto
            const isTextInput = node.tagName === 'INPUT' || node.tagName === 'TEXTAREA';
            
            if (hasTextInputs || isTextInput) {
              // Verifica se não é um elemento de formulário controlado
              if (!isFormikOrReactInput(node) && !node.closest('[data-formik-form]')) {
                shouldApply = true;
                break;
              }
            }
          }
        }
      }
      
      if (shouldApply) break;
    }
    
    if (shouldApply) {
      applyUppercaseTransformer();
    }
  });
  
  // Inicia a observação em todo o body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Utilitário de texto em maiúsculas para campos de entrada inicializado.');
});
