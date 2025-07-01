import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Input, Table, Spinner } from 'reactstrap';
import UnidadeMedidaService from '../../../api/services/unidadeMedidaService';
import UnidadeMedidaFormModal from './UnidadeMedidaFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const UnidadeMedidaSearchModal = ({ isOpen, toggle, onSelect }) => {
  const [unidades, setUnidades] = useState([]);
  const [filteredUnidades, setFilteredUnidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) fetchUnidades();
  }, [isOpen]);

  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const data = await UnidadeMedidaService.getAll();
      setUnidades(data);
      setFilteredUnidades(data);
    } catch (e) {
      setUnidades([]);
      setFilteredUnidades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) setFilteredUnidades(unidades.filter(u => u.situacao !== "0001-01-01T00:00:00"));
    else setFilteredUnidades(
      unidades.filter(u => u.situacao !== "0001-01-01T00:00:00" && u.unidadeMedidaNome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, unidades]);

  const handleSelect = (unidade) => {
    onSelect(unidade);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Selecionar Unidade de Medida</ModalHeader>
      <ModalBody>
        <div className="d-flex mb-2">
          <Input
            placeholder="Buscar unidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="me-2"
          />
          <Button color="success" onClick={() => setShowForm(true)}>
            + Nova Unidade
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
              {filteredUnidades.length === 0 ? (
                <tr><td colSpan="2" className="text-center">Nenhuma unidade encontrada</td></tr>
              ) : (
                filteredUnidades.map(unidade => (
                  <tr key={unidade.id}>
                    <td>{unidade.unidadeMedidaNome}</td>
                    <td>
                      <Button color="primary" size="sm" onClick={() => handleSelect(unidade)}>Selecionar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
        {showForm && (
          <UnidadeMedidaFormModal
            isOpen={showForm}
            toggle={() => setShowForm(false)}
            onSaved={novaUnidade => {
              setShowForm(false);
              fetchUnidades().then(() => {
                onSelect(novaUnidade);
                toggle();
              });
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default UnidadeMedidaSearchModal;
