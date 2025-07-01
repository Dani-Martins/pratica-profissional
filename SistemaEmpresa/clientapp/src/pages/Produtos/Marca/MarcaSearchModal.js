import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Input, Table, Spinner } from 'reactstrap';
import MarcaService from '../../../api/services/marcaService';
import MarcaFormModal from './MarcaFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const MarcaSearchModal = ({ isOpen, toggle, onSelect }) => {
  const [marcas, setMarcas] = useState([]);
  const [filteredMarcas, setFilteredMarcas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) fetchMarcas();
  }, [isOpen]);

  const fetchMarcas = async () => {
    setLoading(true);
    try {
      const data = await MarcaService.getAll();
      setMarcas(data);
      setFilteredMarcas(data);
    } catch (e) {
      setMarcas([]);
      setFilteredMarcas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) setFilteredMarcas(marcas.filter(m => m.situacao !== "0001-01-01T00:00:00"));
    else setFilteredMarcas(
      marcas.filter(m => m.situacao !== "0001-01-01T00:00:00" && m.marcaNome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, marcas]);

  const handleSelect = (marca) => {
    onSelect(marca);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Selecionar Marca</ModalHeader>
      <ModalBody>
        <div className="d-flex mb-2">
          <Input
            placeholder="Buscar marca..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="me-2"
          />
          <Button color="success" onClick={() => setShowForm(true)}>
            + Nova Marca
          </Button>
        </div>
        {loading ? (
          <Spinner color="primary" />
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarcas.length === 0 ? (
                <tr><td colSpan="2" className="text-center">Nenhuma marca encontrada</td></tr>
              ) : (
                filteredMarcas.map(marca => (
                  <tr key={marca.id}>
                    <td>{marca.marcaNome}</td>
                    <td>
                      <Button color="primary" size="sm" onClick={() => handleSelect(marca)}>Selecionar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
        {showForm && (
          <MarcaFormModal
            isOpen={showForm}
            toggle={() => setShowForm(false)}
            onSaved={novaMarca => {
              setShowForm(false);
              fetchMarcas().then(() => {
                onSelect(novaMarca);
                toggle();
              });
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default MarcaSearchModal;
