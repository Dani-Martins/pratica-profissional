import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, 
  Alert, Table, Input, InputGroup, InputGroupText, Badge 
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faFileInvoice } from '@fortawesome/free-solid-svg-icons';

const ModalidadeNFEList = () => {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        setLoading(true);
        // Dados simulados
        setTimeout(() => {
          setModalidades([
            { id: 1, codigo: '01', descricao: 'Venda', observacoes: 'Operação de venda padrão', ativo: true },
            { id: 2, codigo: '02', descricao: 'Compra', observacoes: 'Operação de compra interna', ativo: true },
            { id: 3, codigo: '03', descricao: 'Devolução', observacoes: 'Devolução de mercadoria', ativo: true },
            { id: 4, codigo: '04', descricao: 'Bonificação', observacoes: 'Bonificação para clientes', ativo: true },
            { id: 5, codigo: '05', descricao: 'Demonstração', observacoes: 'Produtos para demonstração', ativo: false }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar modalidades NFE: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchModalidades();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta modalidade?')) {
      try {
        // await ModalidadeNFEService.delete(id);
        setModalidades(modalidades.filter(modalidade => modalidade.id !== id));
      } catch (err) {
        setError('Erro ao excluir modalidade NFE: ' + err.message);
      }
    }
  };
  
  const filteredModalidades = modalidades.filter(modalidade => 
    modalidade.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    modalidade.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
          Modalidades de Nota Fiscal Eletrônica
        </h2>
        <Button 
          color="primary"
          onClick={() => navigate('/modalidades-nfe/novo')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nova Modalidade
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
              <p className="mt-3">Carregando modalidades NFE...</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Observações</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredModalidades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Nenhuma modalidade encontrada
                    </td>
                  </tr>
                ) : (
                  filteredModalidades.map(modalidade => (
                    <tr key={modalidade.id}>
                      <td>{modalidade.codigo}</td>
                      <td>{modalidade.descricao}</td>
                      <td>{modalidade.observacoes}</td>
                      <td>
                        <Badge color={modalidade.ativo ? "success" : "danger"}>
                          {modalidade.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => navigate(`/modalidades-nfe/editar/${modalidade.id}`)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            color="danger" 
                            size="sm"
                            onClick={() => handleDelete(modalidade.id)}
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

export default ModalidadeNFEList;