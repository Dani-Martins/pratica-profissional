// Script para remover qualquer botão flutuante indesejado

document.addEventListener('DOMContentLoaded', function() {
  // Função para remover botões flutuantes não desejados
  function removeFloatingButtons() {
    // Busca por botões flutuantes fora da hierarquia principal da aplicação
    const buttons = document.querySelectorAll('body > button.btn, body > button.btn-primary, body > button.btn-info');
    buttons.forEach(button => {
      // Verifica se é um botão que está fora do #root principal
      if (button && !button.closest('#root')) {
        console.log('Removendo botão flutuante indesejado:', button);
        button.remove();
      }
    });
    
    // Também busca por botões posicionados absolutamente
    const floatingButtons = document.querySelectorAll('button[style*="position: fixed"], button[style*="position: absolute"]');
    floatingButtons.forEach(button => {
      // Verifica se este botão não está dentro de um contexto válido
      if (!button.closest('form') && !button.closest('.modal')) {
        console.log('Removendo botão fixo indesejado:', button);
        button.remove();
      }
    });
  }
  
  // Remover imediatamente após carregar o DOM
  removeFloatingButtons();
  
  // Configurar um observador para detectar novas adições ao DOM
  const observer = new MutationObserver(function(mutations) {
    removeFloatingButtons();
  });
  
  // Observar todo o corpo do documento
  observer.observe(document.body, { 
    childList: true,
    subtree: true 
  });
  
  // Garantir que também removemos botões após o carregamento completo
  window.addEventListener('load', removeFloatingButtons);
});
