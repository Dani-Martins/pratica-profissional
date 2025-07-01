import React, { useState, useEffect } from 'react';
import { 
  Button, Modal, ModalHeader, ModalBody, 
  Table, Input, Spinner, Alert 
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './FuncaoFuncionarioSearchModal.css';
import FuncaoFuncionarioFormModal from './FuncaoFuncionarioFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const FuncaoFuncionarioSearchModal = ({ isOpen, toggle, onSelect, renderButton = true }) => {
  const [funcoes, setFuncoes] = useState([]);
  const [filteredFuncoes, setFilteredFuncoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFuncoes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFuncoes(funcoes);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = funcoes.filter(funcao => 
      funcao.funcaoFuncionarioNome.toLowerCase().includes(lowerSearchTerm) ||
      (funcao.descricao && funcao.descricao.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredFuncoes(filtered);
  }, [searchTerm, funcoes]);

  const fetchFuncoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/FuncaoFuncionario');
      setFuncoes(response.data);
      setFilteredFuncoes(response.data);
    } catch (err) {
      console.error('Erro ao buscar funções de funcionário:', err);
      setError('Não foi possível carregar as funções. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (funcao) => {
    onSelect(funcao);
    toggle();
  };
  
  const handleFuncaoAdded = (novaFuncao) => {
    setFuncoes(prev => [...prev, novaFuncao]);
    setFilteredFuncoes(prev => [...prev, novaFuncao]);
    setShowForm(false);
    
    // Auto-selecionar a função recém-criada
    handleSelect(novaFuncao);
  };

  return (
    <>
      {renderButton && (
        <SearchButton 
          onClick={toggle} 
          title="Buscar função de funcionário"
        />
      )}

      <Modal isOpen={isOpen} toggle={toggle} size="lg" className="modal-funcao-funcionario">
        <ModalHeader toggle={toggle}>Selecionar Função de Funcionário</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Input
              type="text"
              placeholder="Buscar por nome da função..."
              value={searchTerm}
              onChange={handleSearch}
              className="me-2"
            />
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + Nova Função
            </Button>
          </div>

        {loading ? (
          <div className="text-center p-4">
            <Spinner color="primary" />
            <p className="mt-2">Carregando funções...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Função</th>
                  <th>Requer CNH</th>
                  <th>Categoria CNH</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncoes.length > 0 ? (
                  filteredFuncoes.map(funcao => (
                    <tr key={funcao.id}>
                      <td>{funcao.id}</td>
                      <td>{funcao.funcaoFuncionarioNome}</td>
                      <td>{funcao.requerCNH ? 'Sim' : 'Não'}</td>
                      <td>{funcao.tipoCNHRequerido || '-'}</td>
                      <td>{funcao.ativo ? 'Ativo' : 'Inativo'}</td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleSelect(funcao)}
                        >
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {searchTerm ? 'Nenhuma função encontrada com esse termo.' : 'Nenhuma função cadastrada.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>
    </Modal>
    
    {/* Modal de cadastro de função */}
    <FuncaoFuncionarioFormModal
      isOpen={showForm}
      toggle={() => setShowForm(false)}
      onSuccess={handleFuncaoAdded}
    />
  </>
  );
};

export default FuncaoFuncionarioSearchModal;
