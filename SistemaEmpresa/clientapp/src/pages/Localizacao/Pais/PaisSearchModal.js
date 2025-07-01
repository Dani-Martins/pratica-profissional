import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Input, Table, Spinner } from 'reactstrap';
import PaisService from '../../../api/services/paisService';
import PaisFormModal from './PaisFormModal';
import { useMessages } from '../../../contexts/MessageContext';
import SearchButton from '../../../components/buttons/SearchButton';

const PaisSearchModal = ({ isOpen = false, toggle, onSelect, renderButton = true }) => {
  const [paises, setPaises] = useState([]);
  const [filteredPaises, setFilteredPaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { showError } = useMessages();

  // Carregar países quando o modal for aberto
  useEffect(() => {
    if (isOpen) {
      loadPaises();
    }
  }, [isOpen]);

  // Filtrar países quando o termo de busca mudar
  useEffect(() => {
    if (paises.length) {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredPaises(
        paises.filter(pais => 
          pais.nome.toLowerCase().includes(lowercasedTerm) || 
          pais.sigla.toLowerCase().includes(lowercasedTerm)
        )
      );
    }
  }, [searchTerm, paises]);

  const loadPaises = async () => {
    try {
      setLoading(true);
      const data = await PaisService.getAll();
      setPaises(data);
      setFilteredPaises(data);
    } catch (error) {
      showError('Erro ao carregar países: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Certifique-se de que está passando o objeto país completo
  const handleSelect = (pais) => {
    // Garantir que temos um objeto país válido com ID
    if (pais && pais.id) {
      onSelect(pais);
      toggle();
    }
  };
  // Função para lidar com o novo país adicionado
  const handlePaisAdded = (novoPais) => {
    console.log("Novo país adicionado:", novoPais);
    
    if (!novoPais || !novoPais.id) {
      console.error("País recebido é inválido:", novoPais);
      showError("Não foi possível adicionar o país. Dados incompletos.");
      return;
    }

    // Atualizar as listas
    setPaises(prev => [...prev, novoPais]);
    setFilteredPaises(prev => [...prev, novoPais]);
    setShowForm(false);
    
    // Auto-selecionar o país recém-criado
    handleSelect(novoPais);
      // Fechar o modal de pesquisa
    toggle(); // Agora usamos o toggle passado como prop
  };

  return (
    <>
      {/* Botão da lupa */}      {renderButton && (
        <SearchButton 
          onClick={toggle} 
          title="Buscar país"
        />
      )}

      {/* Modal de consulta */}
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Consulta de Países</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Input
              type="text"
              placeholder="Buscar por nome ou sigla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="me-2"
            />
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + Novo País
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner color="primary" />
              <p className="mt-2">Carregando países...</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>País</th>
                  <th>Sigla</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaises.length > 0 ? (
                  filteredPaises.map(pais => (
                    <tr key={pais.id}>
                      <td>{pais.nome}</td>
                      <td>{pais.sigla}</td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleSelect(pais)}>
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      Nenhum país encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Modal para criação de novo país */}
      <PaisFormModal 
        isOpen={showForm} 
        toggle={() => setShowForm(!showForm)} 
        onSuccess={handlePaisAdded} 
      />
    </>
  );
};

export default PaisSearchModal;