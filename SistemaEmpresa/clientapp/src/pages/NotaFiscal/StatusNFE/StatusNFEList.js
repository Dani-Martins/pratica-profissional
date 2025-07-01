import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, 
  Alert, Table, Input, InputGroup, InputGroupText, Badge 
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const StatusNFEList = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        // Dados simulados
        setTimeout(() => {
          setStatuses([
            { id: 1, codigo: '100', descricao: 'Autorizado o uso da NF-e', cor: 'success', observacoes: 'NF-e autorizada com sucesso', ativo: true },
            { id: 2, codigo: '110', descricao: 'Denegado o uso da NF-e', cor: 'danger', observacoes: 'NF-e denegada por irregularidade fiscal', ativo: true },
            { id: 3, codigo: '200', descricao: 'Rejeição', cor: 'warning', observacoes: 'NF-e rejeitada na validação', ativo: true },
            { id: 4, codigo: '300', descricao: 'Em processamento', cor: 'info', observacoes: 'NF-e aguardando processamento', ativo: true },
            { id: 5, codigo: '400', descricao: 'Cancelada', cor: 'secondary', observacoes: 'NF-e cancelada pelo emissor', ativo: true }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar status NFE: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchStatuses();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      try {
        // await StatusNFEService.delete(id);
        setStatuses(statuses.filter(status => status.id !== id));
      } catch (err) {
        setError('Erro ao excluir status NFE: ' + err.message);
      }
    }
  };
  
  const filteredStatuses = statuses.filter(status => 
    status.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    status.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          Status de Nota Fiscal Eletrônica
        </h2>
        <Button 
          color="primary"
          onClick={() => navigate('/status-nfe/novo')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Novo Status
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardBody>
          <InputGroup className="mb-3">
            <InputGroupText>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroupText>
            <Input 
              placeholder="Buscar por código ou descrição..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando status NFE...</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Cor</th>
                  <th>Observações</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStatuses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Nenhum status encontrado
                    </td>
                  </tr>
                ) : (
                  filteredStatuses.map(status => (
                    <tr key={status.id}>
                      <td>{status.codigo}</td>
                      <td>{status.descricao}</td>
                      <td>
                        <Badge color={status.cor} pill>
                          {status.cor}
                        </Badge>
                      </td>
                      <td>{status.observacoes}</td>
                      <td>
                        <Badge color={status.ativo ? "success" : "danger"}>
                          {status.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => navigate(`/status-nfe/editar/${status.id}`)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            color="danger" 
                            size="sm"
                            onClick={() => handleDelete(status.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default StatusNFEList;