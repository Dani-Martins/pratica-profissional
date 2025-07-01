import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, 
  Alert, Table, Input, InputGroup, InputGroupText, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Spinner
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faTruck, faEye, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import TransportadoraService from '../../api/services/transportadoraService';
import './TransportadoraList.css';
import '../Localizacao/Cidade/cidade-search-icon.css';

const TransportadoraList = () => {  
  const [transportadoras, setTransportadoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalExclusao, setModalExclusao] = useState(false);
  const [transportadoraParaExcluir, setTransportadoraParaExcluir] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTransportadoras = async () => {
      try {
        setLoading(true);
        const data = await TransportadoraService.getAll();
        setTransportadoras(data);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar transportadoras: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchTransportadoras();
  }, []);
  
  const confirmarExclusao = (transportadora) => {
    setTransportadoraParaExcluir(transportadora);
    setModalExclusao(true);
  };

  const cancelarExclusao = () => {
    setModalExclusao(false);
    setTransportadoraParaExcluir(null);
  };
  
  const handleDelete = async () => {
    try {
      await TransportadoraService.delete(transportadoraParaExcluir.id);
      setTransportadoras(transportadoras.filter(t => t.id !== transportadoraParaExcluir.id));
      setSuccessMessage(`Transportadora "${transportadoraParaExcluir.nomeFantasia || transportadoraParaExcluir.razaoSocial}" excluída com sucesso!`);
      setModalExclusao(false);
      setTransportadoraParaExcluir(null);
      
      // Limpar mensagem após alguns segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir transportadora: ' + err.message);
      setModalExclusao(false);
    }
  };
    const filteredTransportadoras = transportadoras.filter(transportadora => 
    (transportadora.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     transportadora.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (transportadora.cnpj?.includes(searchTerm)) ||
    (transportadora.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transportadora.cidade?.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faTruck} className="me-2" />
          Transportadoras
        </h2>
        <Button 
          color="primary"
          onClick={() => navigate('/transportadoras/novo')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nova Transportadora
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardBody>
          <InputGroup className="mb-3">
            <InputGroupText>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroupText>
            <Input 
              placeholder="Buscar por nome, CNPJ, email ou cidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>      </Card>
      
      <Card>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}
          {successMessage && <Alert color="success">{successMessage}</Alert>}
            {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando transportadoras...</p>
            </div>
          ) : (            
            <div className="table-responsive">
              <Table hover className="transportadora-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Contato</th>
                    <th>Cidade/UF</th>
                    <th>Data Criação</th>
                    <th>Data Atualização</th>
                    <th>Status</th>
                    <th className="actions-column">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransportadoras.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Nenhuma transportadora encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredTransportadoras.map(transportadora => (
                      <tr key={transportadora.id}>
                        <td>{transportadora.nomeFantasia || transportadora.razaoSocial}</td>
                        <td>{transportadora.cnpj}</td>
                        <td>
                          {transportadora.telefone}<br/>
                          <small>{transportadora.email}</small>
                        </td>
                        <td>{transportadora.cidade?.nome || 'N/A'}/{transportadora.cidade?.estado?.uf || 'N/A'}</td>
                        <td>{transportadora.dataCriacao || '2024-01-01 10:00'}</td>
                        <td>{transportadora.dataAtualizacao || '2024-06-01 15:30'}</td>
                        <td>
                          <Badge color={transportadora.ativo ? "success" : "danger"}>
                            {transportadora.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="actions-column">
                          <Button 
                            color="info" 
                            size="sm"
                            onClick={() => navigate(`/transportadoras/detalhes/${transportadora.id}`)}
                            className="btn-action"
                            aria-label="Detalhes"
                          >
                            Detalhes
                          </Button>
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => navigate(`/transportadoras/editar/${transportadora.id}`)}
                            className="btn-action"
                            aria-label="Editar"
                          >
                            Editar
                          </Button>
                          <Button 
                            color="danger" 
                            size="sm"
                            onClick={() => confirmarExclusao(transportadora)}
                            className="btn-action"
                            aria-label="Excluir"
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Modal de confirmação de exclusão */}      <Modal isOpen={modalExclusao} toggle={cancelarExclusao}>
        <ModalHeader toggle={cancelarExclusao}>Confirmar Exclusão</ModalHeader>
        <ModalBody>
          <div className="d-flex align-items-center mb-3">            <div className="modal-warning-icon">
              <span>!</span>
            </div>
            <span>
              Tem certeza que deseja excluir a transportadora
              <strong>{transportadoraParaExcluir ? ` "${transportadoraParaExcluir.nomeFantasia || transportadoraParaExcluir.razaoSocial}"` : ''}?</strong>
            </span>
          </div>
          <p className="text-muted">Esta ação não poderá ser desfeita.</p>
        </ModalBody>
        <ModalFooter>
          <div className="w-100">
            <Button color="danger" className="me-2" onClick={handleDelete}>
              Excluir
            </Button>
            <Button color="secondary" onClick={cancelarExclusao}>
              Cancelar
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TransportadoraList;