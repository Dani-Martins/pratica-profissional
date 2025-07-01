import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Input, Table, Spinner, Button } from 'reactstrap';
import EstadoService from '../../../api/services/estadoService';
import EstadoModalForm from './EstadoModalForm';
import SearchButton from '../../../components/buttons/SearchButton';
import './estado-search-icon.css';

const EstadoSearchModal = ({ isOpen = false, toggle, onSelect, renderButton = true }) => {
  const [estados, setEstados] = useState([]);
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEstados();
    }
  }, [isOpen]);

  const fetchEstados = async () => {
    try {
      setLoading(true);
      const data = await EstadoService.getAll();
      setEstados(data);
      setFilteredEstados(data);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEstados(estados);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = estados.filter(estado => 
      estado.nome.toLowerCase().includes(lowerSearchTerm) ||
      estado.uf.toLowerCase().includes(lowerSearchTerm) ||
      (estado.paisNome && estado.paisNome.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredEstados(filtered);
  }, [searchTerm, estados]);

  const handleSelect = (estado) => {
    onSelect(estado);
    toggle();
  };

  const handleEstadoAdded = (novoEstado) => {
    setEstados(prev => [...prev, novoEstado]);
    setFilteredEstados(prev => [...prev, novoEstado]);
    setShowForm(false);
    
    // Auto-selecionar o estado recém-criado
    handleSelect(novoEstado);
  };

  return (
    <>      {renderButton && (
        <SearchButton 
          onClick={toggle} 
          title="Buscar estado"
        />
      )}

      {/* Modal de consulta */}
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Consulta de Estados</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Input
              type="text"
              placeholder="Buscar por nome ou UF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="me-2"
            />
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + Novo Estado
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner color="primary" />
              <p className="mt-2">Carregando estados...</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>UF</th>
                  <th>País</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstados.length > 0 ? (
                  filteredEstados.map(estado => (
                    <tr key={estado.id}>
                      <td>{estado.nome}</td>
                      <td>{estado.uf}</td>
                      <td>{estado.paisNome}</td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleSelect(estado)}>
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Nenhum estado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Modal de cadastro */}
      <EstadoModalForm 
        isOpen={showForm} 
        toggle={() => setShowForm(!showForm)} 
        onSuccess={handleEstadoAdded} 
      />
    </>
  );
};

export default EstadoSearchModal;