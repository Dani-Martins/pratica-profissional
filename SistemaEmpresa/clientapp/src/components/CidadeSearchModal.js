import React, { useState, useEffect } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, 
  Button, Table, Input, Spinner, Alert, InputGroup,
  Badge
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CidadeSearchModal = ({ isOpen, toggle, onSelect }) => {
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCidades, setFilteredCidades] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCidades();
    }
  }, [isOpen]);
  useEffect(() => {
    if (cidades.length > 0) {
      filterCidades();
    }
  }, [searchTerm, cidades]);
  
  // Força buscar as cidades ao abrir o modal e quando o termo de pesquisa muda
  useEffect(() => {
    if (isOpen) {
      fetchCidades();
    }
  }, [isOpen, searchTerm]);
  const fetchCidades = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/Cidade';
      if (searchTerm) {
        url += `?search=${searchTerm}`;
      }
      const response = await axios.get(url);
      setCidades(response.data);
      setFilteredCidades(response.data);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Erro ao carregar a lista de cidades.');
    } finally {
      setLoading(false);
    }
  };

  const filterCidades = () => {
    if (!searchTerm.trim()) {
      setFilteredCidades(cidades);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = cidades.filter(cidade => 
      cidade.nome.toLowerCase().includes(term) || 
      cidade.estado?.nome.toLowerCase().includes(term) ||
      cidade.estado?.uf.toLowerCase().includes(term)
    );
    setFilteredCidades(filtered);
  };

  const handleSelectCidade = (cidade) => {
    onSelect(cidade);
    toggle();
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Consulta de Cidades</ModalHeader>
      <ModalBody>        <div className="d-flex mb-3">
          <Input
            placeholder="Buscar por cidade ou estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow-1"
          />
          <Button 
            color="success" 
            className="ms-2"
            onClick={() => {
              toggle();
              setTimeout(() => {
                if (window.openCidadeModal) {
                  window.openCidadeModal();
                }
              }, 100);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nova Cidade
          </Button>
        </div>

        {error && <Alert color="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-3">
            <Spinner color="primary" />
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table striped hover>              <thead>
                <tr>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>País</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCidades.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      {searchTerm ? 'Nenhuma cidade encontrada.' : 'Nenhuma cidade cadastrada.'}
                    </td>
                  </tr>
                ) : (
                  filteredCidades.map(cidade => (
                    <tr key={cidade.id}>
                      <td>{cidade.nome}</td>
                      <td>{cidade.estado?.nome || '-'} ({cidade.estado?.uf || '-'})</td>
                      <td>{cidade.estado?.pais?.nome || '-'}</td>
                      <td>                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleSelectCidade(cidade)}
                        >
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>      <ModalFooter>
        <div className="w-100 text-end">
          <Button color="secondary" onClick={toggle}>
            Cancelar
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CidadeSearchModal;
