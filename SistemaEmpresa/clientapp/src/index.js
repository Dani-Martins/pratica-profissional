import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './fix.css'; // Importando o fix.css para corrigir o botão flutuante
import './components/icons/search-icon-override.css'; // Garantir que os ícones de busca apareçam corretamente
import './components/icons/search-icons.css'; // Garantir que os ícones de lupa FontAwesome apareçam corretamente
import './components/buttons/search-button.css'; // Estilos para o botão de pesquisa padronizado
import './components/buttons/search-btn-cadastro.css'; // Estilos específicos para os botões de lupa das páginas de cadastro
import './utils/uppercaseTransformer'; // Transforma todos os textos em maiúsculas
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
