import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, 
  Alert, Table, Input, InputGroup, InputGroupText, Badge 
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faSearch, 
  faFileInvoice, faEye, faFilePdf
} from '@fortawesome/free-solid-svg-icons';

const NotaFiscalList = () => {
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchNotasFiscais = async () => {
      try {
        setLoading(true);
        // Dados simulados
        setTimeout(() => {
          setNotasFiscais([
            { id: 1, numero: '000001', serie: '1', dataEmissao: '2023-04-10', cliente: 'Cliente A', valor: 1560.75, statusNfe: 'Aprovada', chaveAcesso: '31230428142730000143550010000000011020304158' },
            { id: 2, numero: '000002', serie: '1', dataEmissao: '2023-04-12', cliente: 'Cliente B', valor: 2345.90, statusNfe: 'Aprovada', chaveAcesso: '31230428142730000143550010000000021847392812' },
            { id: 3, numero: '000003', serie: '1', dataEmissao: '2023-04-15', cliente: 'Cliente C', valor: 985.50, statusNfe: 'Pendente', chaveAcesso: '31230428142730000143550010000000031898234521' },
            { id: 4, numero: '000004', serie: '1', dataEmissao: '2023-04-18', cliente: 'Cliente D', valor: 3750.25, statusNfe: 'Aprovada', chaveAcesso: '31230428142730000143550010000000041239857463' },
            { id: 5, numero: '000005', serie: '1', dataEmissao: '2023-04-20', cliente: 'Cliente E', valor: 890.00, statusNfe: 'Rejeitada', chaveAcesso: '31230428142730000143550010000000051234567890' }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar notas fiscais: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchNotasFiscais();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        // await NotaFiscalService.delete(id);
        setNotasFiscais(notasFiscais.filter(notaFiscal => notaFiscal.id !== id));
      } catch (err) {
        setError('Erro ao excluir nota fiscal: ' + err.message);
      }
    }
  };
  
  const getBadgeColor = status => {
    switch (status.toLowerCase()) {
      case 'aprovada':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'rejeitada':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const filteredNotasFiscais = notasFiscais.filter(notaFiscal => 
    notaFiscal.numero.includes(searchTerm) || 
    notaFiscal.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notaFiscal.chaveAcesso.includes(searchTerm)
  );
  
  return (
    <>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
          Notas Fiscais
        </h2>
        <Button 
          color="primary"
          onClick={() => navigate('/notas-fiscais/novo')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nova Nota Fiscal
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardBody>
          <InputGroup className="mb-3">
            <InputGroupText>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroupText>
            <Input 
              placeholder="Buscar por número, cliente ou chave de acesso..." 
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
              <p className="mt-3">Carregando notas fiscais...</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Data Emissão</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotasFiscais.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Nenhuma nota fiscal encontrada
                    </td>
                  </tr>
                ) : (
                  filteredNotasFiscais.map(notaFiscal => (
                    <tr key={notaFiscal.id}>
                      <td>{notaFiscal.serie}-{notaFiscal.numero}</td>
                      <td>{formatDate(notaFiscal.dataEmissao)}</td>
                      <td>{notaFiscal.cliente}</td>
                      <td>R$ {notaFiscal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <Badge color={getBadgeColor(notaFiscal.statusNfe)}>
                          {notaFiscal.statusNfe}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => navigate(`/notas-fiscais/${notaFiscal.id}`)}
                            title="Visualizar"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            color="success" 
                            size="sm"
                            title="DANFE"
                            onClick={() => window.open(`/api/notas-fiscais/${notaFiscal.id}/danfe`, '_blank')}
                          >
                            <FontAwesomeIcon icon={faFilePdf} />
                          </Button>
                          <Button 
                            color="danger" 
                            size="sm"
                            onClick={() => handleDelete(notaFiscal.id)}
                            title="Excluir"
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

export default NotaFiscalList;