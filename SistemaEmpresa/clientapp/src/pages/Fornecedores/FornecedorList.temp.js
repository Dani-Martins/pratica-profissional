import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Spinner, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Badge } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FornecedorService } from '../../api/services/fornecedorService';

const FornecedorList = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState(null);
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    setLoading(true);
    try {
      const data = await FornecedorService.getAll();
      setFornecedores(data);
      setError(null);
      console.log("Fornecedores carregados:", data);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
      setError('Não foi possível carregar a lista de fornecedores. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    try {
      await FornecedorService.excluir(fornecedorParaExcluir.id);
      setConfirmarExclusao(null);
      carregarFornecedores();
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      alert(`Erro ao excluir fornecedor: ${err.response?.data?.mensagem || 'Verifique se não há registros dependentes.'}`);
    }
  };

  if (loading && fornecedores.length === 0) {
    return (
      <Container className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <div>
      <Container fluid className="p-0">
        <Card className="border-0">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Fornecedores</h2>
            <Button 
              color="primary" 
              onClick={() => navigate('/fornecedores/novo')}
            >
              Novo Fornecedor
            </Button>
          </div>
          
          {error && (
            <Alert color="danger">{error}</Alert>
          )}
          
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Nenhum fornecedor encontrado
                    </td>
                  </tr>
                ) : (
                  fornecedores.map(fornecedor => (
                    <tr key={fornecedor.id}>
                      <td>{fornecedor.id}</td>
                      <td>{fornecedor.razaoSocial}</td>
                      <td>{fornecedor.cnpj}</td>
                      <td>{fornecedor.email}</td>
                      <td>{fornecedor.telefone}</td>
                      <td>
                        <Badge color={fornecedor.ativo ? 'success' : 'danger'}>
                          {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          color="info" 
                          size="sm" 
                          className="me-2"
                          onClick={() => navigate(`/fornecedores/editar/${fornecedor.id}`)}
                        >
                          Editar
                        </Button>
                        <Button 
                          color="danger" 
                          size="sm"
                          onClick={() => {
                            setFornecedorParaExcluir(fornecedor);
                            setConfirmarExclusao(fornecedor);
                          }}
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
        </Card>

        <Modal isOpen={!!confirmarExclusao} toggle={() => setConfirmarExclusao(null)}>
          <ModalHeader toggle={() => setConfirmarExclusao(null)}>
            Excluir Fornecedor
          </ModalHeader>
          <ModalBody>
            Tem certeza que deseja excluir o fornecedor "{confirmarExclusao?.razaoSocial || confirmarExclusao?.nome}"?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleExcluir} className="me-2">
              Excluir
            </Button>
            <Button color="secondary" onClick={() => setConfirmarExclusao(null)}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default FornecedorList;
