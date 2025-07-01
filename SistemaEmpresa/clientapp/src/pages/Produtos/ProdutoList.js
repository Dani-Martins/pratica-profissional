import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Button, Input, Row, Col, Alert, Table, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import ProdutoService from '../../api/services/produtoService';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

moment.locale('pt-br');

const ProdutoList = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('ATIVOS');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [modalExclusao, setModalExclusao] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // MOCK: Se não houver produtos reais, exibe alguns mockados
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        let data = [];
        try {
          data = await ProdutoService.getAll();
        } catch (error) {
          // Se falhar, usa mock
          data = [];
        }
        if (!data || data.length === 0) {
          data = [
            {
              id: 1,
              nome: 'Arroz Branco',
              categoriaNome: 'Alimentos',
              marcaNome: 'Tio João',
              unidadeMedidaNome: 'Kg',
              preco: 5.99,
              situacao: true,
              dataCriacao: new Date(),
              dataAlteracao: new Date()
            },
            {
              id: 2,
              nome: 'Refrigerante',
              categoriaNome: 'Bebidas',
              marcaNome: 'Coca-Cola',
              unidadeMedidaNome: 'L',
              preco: 7.5,
              situacao: true,
              dataCriacao: new Date(),
              dataAlteracao: new Date()
            },
            {
              id: 3,
              nome: 'Sabonete',
              categoriaNome: 'Higiene',
              marcaNome: 'Lux',
              unidadeMedidaNome: 'Unidade',
              preco: 2.2,
              situacao: false,
              dataCriacao: new Date(),
              dataAlteracao: new Date()
            }
          ];
        }
        setProdutos(data);
        setError(null);
      } catch (error) {
        setError('Falha ao carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // Filtros
  const produtosFiltrados = produtos
    .filter(produto =>
      (filtroSituacao === 'ATIVOS' ? produto.ativo : filtroSituacao === 'INATIVOS' ? !produto.ativo : true)
    )
    .filter(produto =>
      filtroCategoria ? produto.categoria === filtroCategoria : true
    )
    .filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.codigo && produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const categorias = [...new Set(produtos.map(produto => produto.categoria).filter(Boolean))];

  const confirmarExclusao = (produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusao(true);
  };

  const cancelarExclusao = () => {
    setModalExclusao(false);
    setProdutoParaExcluir(null);
  };

  const handleDelete = async () => {
    try {
      await ProdutoService.delete(produtoParaExcluir.id);
      setProdutos(produtos.filter(produto => produto.id !== produtoParaExcluir.id));
      setModalExclusao(false);
      setProdutoParaExcluir(null);
      setError({ type: 'success', message: `Produto "${produtoParaExcluir.nome}" inativado com sucesso!` });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Erro ao inativar produto: ' + (err.response?.data || err.message));
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Produtos</h2>
        <Button color="primary" onClick={() => navigate('/produtos/novo')}>+ Novo Produto</Button>
      </div>
      <Card>
        <CardBody>
          <Row className="mb-3">
            <Col md={3}>
              <Input
                type="select"
                value={filtroSituacao}
                onChange={e => setFiltroSituacao(e.target.value)}
              >
                <option value="ATIVOS">SOMENTE ATIVOS</option>
                <option value="INATIVOS">SOMENTE INATIVOS</option>
                <option value="TODOS">TODOS</option>
              </Input>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
              >
                <option value="">TODAS AS CATEGORIAS</option>
                {categorias.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </Input>
            </Col>
            <Col md={4}>
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          <div className="mb-2">
            Exibindo {produtosFiltrados.length} de {produtos.length} produtos
          </div>

          {error && <Alert color={error.type === 'success' ? 'success' : 'danger'} fade={false}>{error.message || error}</Alert>}

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando produtos...</p>
            </div>
          ) : (
            <Table hover responsive striped>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Quantidade</th>
                  <th>Situação</th>
                  <th>Data Criação</th>
                  <th>Data Atualização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">Nenhum produto encontrado</td>
                  </tr>
                ) : (
                  produtosFiltrados.map(produto => (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td>{produto.categoria || '-'}</td>
                      <td>{typeof produto.quantidade === 'number' && !isNaN(produto.quantidade) ? produto.quantidade : '-'}</td>
                      <td>
                        {Boolean(produto.ativo) ?
                          <span className="badge rounded-pill bg-success" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Ativo
                          </span>
                          :
                          <span className="badge rounded-pill bg-danger" style={{ fontSize: 14, padding: '7px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                            Inativo
                          </span>
                        }
                      </td>
                      <td>
                        {produto.dataCriacao ? moment(produto.dataCriacao).format('DD/MM/YYYY HH:mm') : '-'}
                        <small className="d-block text-muted">{produto.userCriacao || 'Sistema'}</small>
                      </td>
                      <td>
                        {produto.dataAlteracao ? moment(produto.dataAlteracao).format('DD/MM/YYYY HH:mm') : '-'}
                        <small className="d-block text-muted">{produto.userAtualizacao || 'Sistema'}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ minWidth: 90, fontWeight: 500 }}
                            onClick={() => navigate(`/produtos/detalhes/${produto.id}`)}
                          >
                            Detalhes
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            style={{ minWidth: 70, fontWeight: 500 }}
                            onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                          >
                            Editar
                          </button>
                          {Boolean(produto.ativo) && (
                            <button
                              className="btn btn-sm btn-danger"
                              style={{ minWidth: 80, fontWeight: 500 }}
                              onClick={() => confirmarExclusao(produto)}
                            >
                              Excluir
                            </button>
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

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={modalExclusao} toggle={cancelarExclusao}>
        <ModalHeader toggle={cancelarExclusao}>Inativar Produto</ModalHeader>
        <ModalBody>
          Tem certeza que deseja inativar o produto "{produtoParaExcluir?.nome}"?
          <p className="text-muted mt-2 mb-0">
            <small>
              O produto será marcado como inativo, mas continuará no sistema.<br/>
              Produtos inativos não aparecem nas listagens padrão e não podem ser utilizados em novas operações.
            </small>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={cancelarExclusao}>Cancelar</Button>
          <Button color="danger" onClick={handleDelete}>Inativar</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ProdutoList;