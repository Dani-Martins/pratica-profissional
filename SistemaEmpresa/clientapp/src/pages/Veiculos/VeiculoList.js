import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, 
  Alert, Table, Input, InputGroup, InputGroupText, Badge 
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faCar } from '@fortawesome/free-solid-svg-icons';

const VeiculoList = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchVeiculos = async () => {
      try {
        setLoading(true);
        // Dados simulados
        setTimeout(() => {
          setVeiculos([
            { id: 1, placa: 'ABC-1234', marca: 'Volvo', modelo: 'FH 460', ano: 2020, transportadora: 'Transportadora A', ativo: true, dataCriacao: new Date('2024-01-10'), dataAtualizacao: new Date('2025-06-01') },
            { id: 2, placa: 'DEF-5678', marca: 'Mercedes-Benz', modelo: 'Actros 2546', ano: 2019, transportadora: 'Transportadora B', ativo: true, dataCriacao: new Date('2023-11-05'), dataAtualizacao: new Date('2025-05-15') },
            { id: 3, placa: 'GHI-9012', marca: 'Scania', modelo: 'R450', ano: 2021, transportadora: 'Transportadora C', ativo: false, dataCriacao: new Date('2024-03-20'), dataAtualizacao: new Date('2025-04-20') },
            { id: 4, placa: 'JKL-3456', marca: 'Iveco', modelo: 'Daily 35S14', ano: 2018, transportadora: 'Transportadora A', ativo: true, dataCriacao: new Date('2022-09-12'), dataAtualizacao: new Date('2025-03-10') },
            { id: 5, placa: 'MNO-7890', marca: 'Ford', modelo: 'Transit', ano: 2022, transportadora: 'Transportadora D', ativo: true, dataCriacao: new Date('2025-01-01'), dataAtualizacao: new Date('2025-06-15') }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar veículos: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchVeiculos();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        // await VeiculoService.delete(id);
        setVeiculos(veiculos.filter(veiculo => veiculo.id !== id));
      } catch (err) {
        setError('Erro ao excluir veículo: ' + err.message);
      }
    }
  };
  
  const filteredVeiculos = veiculos.filter(veiculo => 
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.transportadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faCar} className="me-2" />
          Veículos
        </h2>
        <Button 
          color="primary"
          onClick={() => navigate('/veiculos/novo')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Novo Veículo
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardBody>
          <InputGroup className="mb-3">
            <InputGroupText>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroupText>
            <Input 
              placeholder="Buscar por placa, marca, modelo, transportadora ou tipo..." 
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
              <p className="mt-3">Carregando veículos...</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca/Modelo</th>
                  <th>Transportadora</th>
                  <th>Status</th>
                  <th>Data Criação</th>
                  <th>Data Atualização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVeiculos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Nenhum veículo encontrado
                    </td>
                  </tr>
                ) : (
                  filteredVeiculos.map(veiculo => (
                    <tr key={veiculo.id}>
                      <td>{veiculo.placa}</td>
                      <td>{veiculo.marca} {veiculo.modelo}</td>
                      <td>{veiculo.transportadora}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 bg-${veiculo.ativo ? 'success' : 'danger'}`}>{veiculo.ativo ? 'Ativo' : 'Inativo'}</span>
                      </td>
                      <td>{veiculo.dataCriacao ? veiculo.dataCriacao.toLocaleDateString('pt-BR') : '-'}</td>
                      <td>{veiculo.dataAtualizacao ? veiculo.dataAtualizacao.toLocaleDateString('pt-BR') : '-'}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button color="primary" size="sm" onClick={() => navigate(`/veiculos/detalhes/${veiculo.id}`)}>
                            Detalhes
                          </Button>
                          <Button color="info" size="sm" onClick={() => navigate(`/veiculos/editar/${veiculo.id}`)}>
                            Editar
                          </Button>
                          {veiculo.ativo && (
                            <Button color="danger" size="sm" onClick={() => handleDelete(veiculo.id)}>
                              Excluir
                            </Button>
                          )}
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

export default VeiculoList;