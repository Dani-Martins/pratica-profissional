import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './search-button.css';

/**
 * Componente padronizado para o botão de lupa usado em toda a aplicação
 * Garantindo a consistência visual dos botões de pesquisa
 * Estilizado conforme o padrão da página principal de cadastro
 */
const SearchButton = ({ onClick, title = 'Buscar', className = '', ...props }) => {
  return (
    <Button
      onClick={onClick}
      title={title}
      className={`search-btn-cadastro ${className}`}
      type="button"
      {...props}
    >
      <FontAwesomeIcon icon={faSearch} className="search-icon-visible" />
    </Button>
  );
};

export default SearchButton;
