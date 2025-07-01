import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Input, Table, Spinner } from 'reactstrap';
import CidadeService from '../../../api/services/cidadeService';
import CidadeFormModal from './CidadeFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const CidadeSearchModal = ({ isOpen, toggle, onSelect, renderButton = true }) => {
  const [cidades, setCidades] = useState([]);
  const [filteredCidades, setFilteredCidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCidades();
    }
  }, [isOpen]);
  const fetchCidades = async () => {
    try {
      setLoading(true);
      const data = await CidadeService.getAll();
      setCidades(data);
      setFilteredCidades(data);
      
      // Movido para dentro da função, após receber os dados
      if (data && data.length > 0) {
        console.log('Estrutura de um objeto cidade:', data[0]);
        console.log('Detalhes do estado da primeira cidade:', {
          estadoId: data[0].estadoId,
          estadoNome: data[0].estadoNome,
          estadoObj: data[0].estado,
          paisNome: data[0].paisNome
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCidades(cidades);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = cidades.filter(cidade => 
      cidade.nome.toLowerCase().includes(lowerSearchTerm) ||
      cidade.estadoNome.toLowerCase().includes(lowerSearchTerm) ||
      cidade.estadoUf.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredCidades(filtered);
  }, [searchTerm, cidades]);

  const handleSelect = (cidade) => {
    onSelect(cidade);
    toggle();
  };

  const handleCidadeAdded = (novaCidade) => {
    setCidades(prev => [...prev, novaCidade]);
    setFilteredCidades(prev => [...prev, novaCidade]);
    setShowForm(false);
    
    // Auto-selecionar a cidade recém-criada
    handleSelect(novaCidade);
  };

  return (
    <>
      {renderButton && (        <SearchButton 
          onClick={toggle} 
          title="Buscar cidade"
        />
      )}

      {/* Modal de consulta */}
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Consulta de Cidades</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Input
              type="text"
              placeholder="Buscar por cidade ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="me-2"
            />
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + Nova Cidade
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner color="primary" />
              <p className="mt-2">Carregando cidades...</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>País</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCidades.length > 0 ? (
                  filteredCidades.map(cidade => (
                    <tr key={cidade.id}>                      <td>{cidade.nome}</td>
                      <td>{cidade.estadoNome || cidade.estado?.nome || cidade.estado?.sigla || '-'}</td>                      <td>
                        {cidade.paisNome || cidade.estado?.pais?.nome || cidade.pais?.nome || '-'}
                      </td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleSelect(cidade)}>
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Nenhuma cidade encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Modal de cadastro */}
      <CidadeFormModal 
        isOpen={showForm} 
        toggle={() => setShowForm(!showForm)} 
        onSuccess={handleCidadeAdded} 
      />
    </>
  );
};

export default CidadeSearchModal;