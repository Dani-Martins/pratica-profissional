import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Input, Table, Spinner } from 'reactstrap';
import CategoriaService from '../../../api/services/categoriaService';
import CategoriaFormModal from './CategoriaFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const CategoriaSearchModal = ({ isOpen, toggle, onSelect }) => {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) fetchCategorias();
  }, [isOpen]);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await CategoriaService.getAll();
      setCategorias(data);
      setFilteredCategorias(data);
    } catch (e) {
      setCategorias([]);
      setFilteredCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) setFilteredCategorias(categorias.filter(c => c.situacao !== "0001-01-01T00:00:00"));
    else setFilteredCategorias(
      categorias.filter(c => c.situacao !== "0001-01-01T00:00:00" && c.categoriaNome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, categorias]);

  const handleSelect = (categoria) => {
    onSelect(categoria);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Selecionar Categoria</ModalHeader>
      <ModalBody>
        <div className="d-flex mb-2">
          <Input
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="me-2"
          />
          <Button color="success" onClick={() => setShowForm(true)}>
            + Nova Categoria
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
              {filteredCategorias.length === 0 ? (
                <tr><td colSpan="2" className="text-center">Nenhuma categoria encontrada</td></tr>
              ) : (
                filteredCategorias.map(categoria => (
                  <tr key={categoria.id}>
                    <td>{categoria.categoriaNome}</td>
                    <td>
                      <Button color="primary" size="sm" onClick={() => handleSelect(categoria)}>Selecionar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
        {showForm && (
          <CategoriaFormModal
            isOpen={showForm}
            toggle={() => setShowForm(false)}
            onSaved={novaCategoria => {
              setShowForm(false);
              fetchCategorias().then(() => {
                onSelect(novaCategoria);
                toggle();
              });
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default CategoriaSearchModal;
