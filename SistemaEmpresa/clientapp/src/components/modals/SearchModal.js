import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, 
         InputGroup, Table, Spinner, Alert } from 'reactstrap';
import { FormModal } from './ModalSystem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchButton from '../buttons/SearchButton';

// Ícone de lupa usando FontAwesome para padronizar com o resto do sistema
export const SearchIcon = () => (
  <FontAwesomeIcon icon={faSearch} className="search-icon-visible" />
);

const SearchModal = ({
  isOpen,
  toggle,
  title = 'Consulta',
  fetchItems, // função para buscar itens
  columns, // array de objetos com {key, label} para colunas da tabela
  renderItem, // função para renderizar cada linha da tabela
  onSelect, // função chamada quando um item é selecionado
  FormComponent, // componente de formulário para criação de novos itens
  createItemLabel = 'Novo Item', // label do botão para criar novo item
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum item encontrado.'
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Carregar itens quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  // Filtrar itens quando o termo de busca mudar
  useEffect(() => {
    if (items.length) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const results = items.filter(item => 
        Object.values(item).some(
          value => String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFiltered(results);
    }
  }, [searchTerm, items]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchItems();
      setItems(data);
      setFiltered(data);
    } catch (err) {
      setError('Erro ao carregar itens: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleItemCreated = (newItem) => {
    setItems(prev => [...prev, newItem]);
    setFiltered(prev => [...prev, newItem]);
    setShowForm(false); // Fechar formulário de criação
  };

  const handleSelect = (item) => {
    onSelect(item);
    toggle(); // Fechar o modal depois de selecionar
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger" fade={true} timeout={5000}>{error}</Alert>}
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <InputGroup>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + {createItemLabel}
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner color="primary" />
              <p className="mt-2">Carregando...</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map(item => renderItem(item, handleSelect))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Modal para criação de novo item */}
      {FormComponent && (
        <FormComponent
          isOpen={showForm}
          toggle={() => setShowForm(false)}
          onSuccess={handleItemCreated}
        />
      )}
    </>
  );
};

export default SearchModal;