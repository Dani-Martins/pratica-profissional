import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardHeader, CardBody, FormGroup, Label, Input, Button,
  Row, Col, Alert, Spinner, Table, InputGroup, InputGroupText, Badge
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faArrowLeft, faPlus, faTrash, 
  faSearch, faUser, faShoppingCart, faMoneyBill 
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { VendaService, ClienteService, ProdutoService } from '../../api/services';

const VendaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [showClienteSearch, setShowClienteSearch] = useState(false);
  const [showProdutoSearch, setShowProdutoSearch] = useState(false);
  const [clienteBusca, setClienteBusca] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');
  
  // Estado para a venda atual
  const [formData, setFormData] = useState({
    clienteId: '',
    data: new Date(),
    itens: [],
    formaPagamentoId: '',
    condicaoPagamentoId: '',
    observacao: '',
    valorFrete: 0,
    valorDesconto: 0
  });

  // Carregar dados para edição
  useEffect(() => {
    if (id) {
      const fetchVenda = async () => {
        try {
          setLoading(true);
          // Simulação para desenvolvimento
          setTimeout(() => {
            setFormData({
              clienteId: 1,
              data: new Date(),
              itens: [
                { id: 1, produtoId: 1, produto: 'Produto A', quantidade: 2, preco: 19.90, desconto: 0 },
                { id: 2, produtoId: 4, produto: 'Produto D', quantidade: 1, preco: 59.90, desconto: 5 }
              ],
              formaPagamentoId: 1,
              condicaoPagamentoId: 1,
              observacao: 'Entrega no período da tarde',
              valorFrete: 15,
              valorDesconto: 5
            });
            setLoading(false);
          }, 1000);
          
          // Descomente quando a API estiver pronta
          // const data = await VendaService.getById(id);
          // setFormData(data);
        } catch (err) {
          setError('Erro ao buscar venda: ' + err.message);
          setLoading(false);
        }
      };
      
      fetchVenda();
    }
  }, [id]);

  // Carregar clientes e produtos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação para desenvolvimento
        setClientes([
          { id: 1, nome: 'Cliente Exemplo 1', documento: '123.456.789-00' },
          { id: 2, nome: 'Cliente Exemplo 2', documento: '987.654.321-00' },
          { id: 3, nome: 'Cliente Exemplo 3', documento: '456.789.123-00' }
        ]);
        
        setProdutos([
          { id: 1, codigo: 'P001', nome: 'Produto A', preco: 19.90, estoque: 50 },
          { id: 2, codigo: 'P002', nome: 'Produto B', preco: 29.99, estoque: 35 },
          { id: 3, codigo: 'P003', nome: 'Produto C', preco: 9.99, estoque: 0 },
          { id: 4, codigo: 'P004', nome: 'Produto D', preco: 59.90, estoque: 15 },
          { id: 5, codigo: 'P005', nome: 'Produto E', preco: 15.50, estoque: 25 }
        ]);
        
        // Descomente quando a API estiver pronta
        // const clientesData = await ClienteService.getAll();
        // setClientes(clientesData);
        // const produtosData = await ProdutoService.getAll();
        // setProdutos(produtosData);
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
      }
    };
    
    fetchData();
  }, []);

  // Manipular alterações no form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Selecionar cliente da busca
  const handleSelectCliente = (cliente) => {
    setFormData({ ...formData, clienteId: cliente.id });
    setShowClienteSearch(false);
  };

  // Adicionar produto à venda
  const handleAddProduto = (produto) => {
    // Verificar se o produto já está na lista
    const existingItem = formData.itens.find(item => item.produtoId === produto.id);
    
    if (existingItem) {
      // Aumentar a quantidade se já estiver na lista
      const updatedItens = formData.itens.map(item => {
        if (item.produtoId === produto.id) {
          return { ...item, quantidade: item.quantidade + 1 };
        }
        return item;
      });
      setFormData({ ...formData, itens: updatedItens });
    } else {
      // Adicionar novo item
      const newItem = {
        id: Date.now(), // ID temporário
        produtoId: produto.id,
        produto: produto.nome,
        quantidade: 1,
        preco: produto.preco,
        desconto: 0
      };
      setFormData({ 
        ...formData, 
        itens: [...formData.itens, newItem] 
      });
    }
    
    setShowProdutoSearch(false);
  };

  // Remover produto da venda
  const handleRemoveItem = (itemId) => {
    const updatedItens = formData.itens.filter(item => item.id !== itemId);
    setFormData({ ...formData, itens: updatedItens });
  };

  // Atualizar quantidade do item
  const handleUpdateItemQuantidade = (itemId, quantidade) => {
    if (quantidade < 1) return;
    
    const updatedItens = formData.itens.map(item => {
      if (item.id === itemId) {
        return { ...item, quantidade: quantidade };
      }
      return item;
    });
    
    setFormData({ ...formData, itens: updatedItens });
  };

  // Calcular total da venda
  const calcularTotal = () => {
    const subtotal = formData.itens.reduce((total, item) => {
      return total + (item.quantidade * item.preco) - item.desconto;
    }, 0);
    
    return subtotal + Number(formData.valorFrete) - Number(formData.valorDesconto);
  };

  // Salvar venda
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (formData.itens.length === 0) {
        throw new Error('Adicione pelo menos um produto à venda');
      }
      
      if (!formData.clienteId) {
        throw new Error('Selecione um cliente');
      }
      
      // Simulação para desenvolvimento
      console.log('Venda a ser salva:', formData);
      
      // Descomente quando a API estiver pronta
      // if (id) {
      //   await VendaService.update(id, formData);
      // } else {
      //   await VendaService.create(formData);
      // }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/vendas');
      }, 1500);
    } catch (err) {
      setError('Erro ao salvar venda: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes pela busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    cliente.documento.toLowerCase().includes(clienteBusca.toLowerCase())
  );

  // Filtrar produtos pela busca
  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(produtoBusca.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(produtoBusca.toLowerCase())
  );

  // Obter nome do cliente selecionado
  const clienteSelecionado = clientes.find(c => c.id === formData.clienteId);

  if (loading && id) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados da venda...</p>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{id ? 'Editar Venda' : 'Nova Venda'}</h2>
        <Button color="secondary" onClick={() => navigate('/vendas')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar
        </Button>
      </div>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">Venda salva com sucesso!</Alert>}

      <form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <CardHeader className="bg-primary text-white">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Dados do Cliente e Venda
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="clienteId">Cliente *</Label>
                      <InputGroup>
                        <Input
                          type="text"
                          value={clienteSelecionado ? clienteSelecionado.nome : ''}
                          placeholder="Selecione um cliente"
                          onClick={() => setShowClienteSearch(true)}
                          readOnly
                        />
                        <Button 
                          color="secondary"
                          onClick={() => setShowClienteSearch(true)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </InputGroup>
                    </FormGroup>
                    
                    {showClienteSearch && (
                      <Card className="position-absolute z-3 w-75 shadow">
                        <CardBody>
                          <div className="d-flex justify-content-between mb-2">
                            <h6>Selecione um Cliente</h6>
                            <Button 
                              close 
                              onClick={() => setShowClienteSearch(false)} 
                            />
                          </div>
                          <Input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={clienteBusca}
                            onChange={(e) => setClienteBusca(e.target.value)}
                            className="mb-2"
                          />
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <Table hover size="sm">
                              <thead>
                                <tr>
                                  <th>Nome</th>
                                  <th>Documento</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {clientesFiltrados.map(cliente => (
                                  <tr key={cliente.id}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.documento}</td>
                                    <td>
                                      <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() => handleSelectCliente(cliente)}
                                      >
                                        Selecionar
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="data">Data da Venda</Label>
                      <DatePicker
                        selected={formData.data}
                        onChange={(date) => setFormData({ ...formData, data: date })}
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="formaPagamentoId">Forma de Pagamento</Label>
                      <Input
                        type="select"
                        name="formaPagamentoId"
                        value={formData.formaPagamentoId}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="1">Dinheiro</option>
                        <option value="2">Cartão de Crédito</option>
                        <option value="3">Cartão de Débito</option>
                        <option value="4">PIX</option>
                        <option value="5">Boleto</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="condicaoPagamentoId">Condição de Pagamento</Label>
                      <Input
                        type="select"
                        name="condicaoPagamentoId"
                        value={formData.condicaoPagamentoId}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="1">À Vista</option>
                        <option value="2">2x sem juros</option>
                        <option value="3">3x sem juros</option>
                        <option value="4">30/60/90 dias</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                
                <FormGroup>
                  <Label for="observacao">Observações</Label>
                  <Input
                    type="textarea"
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </FormGroup>
              </CardBody>
            </Card>
            
            <Card className="mb-4">
              <CardHeader className="bg-primary text-white">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Itens da Venda
              </CardHeader>
              <CardBody>
                <div className="d-flex justify-content-between mb-3">
                  <h6>Produtos</h6>
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setShowProdutoSearch(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Adicionar Produto
                  </Button>
                </div>
                
                {showProdutoSearch && (
                  <Card className="position-absolute z-3 w-75 shadow">
                    <CardBody>
                      <div className="d-flex justify-content-between mb-2">
                        <h6>Adicionar Produto</h6>
                        <Button 
                          close 
                          onClick={() => setShowProdutoSearch(false)} 
                        />
                      </div>
                      <Input
                        type="text"
                        placeholder="Buscar produto por nome ou código..."
                        value={produtoBusca}
                        onChange={(e) => setProdutoBusca(e.target.value)}
                        className="mb-2"
                      />
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Nome</th>
                              <th>Preço</th>
                              <th>Estoque</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {produtosFiltrados.map(produto => (
                              <tr key={produto.id}>
                                <td>{produto.codigo}</td>
                                <td>{produto.nome}</td>
                                <td>
                                  {produto.preco.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  })}
                                </td>
                                <td>
                                  <Badge color={produto.estoque <= 0 ? 'danger' : 'success'}>
                                    {produto.estoque}
                                  </Badge>
                                </td>
                                <td>
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() => handleAddProduto(produto)}
                                    disabled={produto.estoque <= 0}
                                  >
                                    Adicionar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                )}
                
                {formData.itens.length === 0 ? (
                  <Alert color="info">
                    Nenhum item adicionado à venda. Clique em "Adicionar Produto".
                  </Alert>
                ) : (
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th width="120">Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Desconto</th>
                        <th>Subtotal</th>
                        <th width="80">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens.map(item => {
                        const subtotal = (item.quantidade * item.preco) - item.desconto;
                        return (
                          <tr key={item.id}>
                            <td>{item.produto}</td>
                            <td>
                              <InputGroup size="sm">
                                <Button 
                                  size="sm"
                                  color="secondary"
                                  onClick={() => handleUpdateItemQuantidade(item.id, item.quantidade - 1)}
                                >
                                  -
                                </Button>
                                <Input 
                                  size="sm"
                                  value={item.quantidade}
                                  min="1"
                                  onChange={(e) => handleUpdateItemQuantidade(item.id, parseInt(e.target.value) || 1)}
                                  className="text-center"
                                />
                                <Button 
                                  size="sm"
                                  color="secondary"
                                  onClick={() => handleUpdateItemQuantidade(item.id, item.quantidade + 1)}
                                >
                                  +
                                </Button>
                              </InputGroup>
                            </td>
                            <td>
                              {item.preco.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </td>
                            <td>
                              {item.desconto.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </td>
                            <td>
                              {subtotal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </td>
                            <td>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4 sticky-top" style={{top: '20px'}}>
              <CardHeader className="bg-success text-white">
                <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                Resumo da Venda
              </CardHeader>
              <CardBody>
                <Table borderless>
                  <tbody>
                    <tr>
                      <th>Subtotal:</th>
                      <td className="text-end">
                        {formData.itens.reduce((total, item) => {
                          return total + (item.quantidade * item.preco);
                        }, 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <th>Desconto no item:</th>
                      <td className="text-end">
                        {formData.itens.reduce((total, item) => {
                          return total + item.desconto;
                        }, 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <th>Frete:</th>
                      <td className="text-end">
                        <InputGroup size="sm">
                          <InputGroupText>R$</InputGroupText>
                          <Input
                            name="valorFrete"
                            value={formData.valorFrete}
                            onChange={handleInputChange}
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </InputGroup>
                      </td>
                    </tr>
                    <tr>
                      <th>Desconto adicional:</th>
                      <td className="text-end">
                        <InputGroup size="sm">
                          <InputGroupText>R$</InputGroupText>
                          <Input
                            name="valorDesconto"
                            value={formData.valorDesconto}
                            onChange={handleInputChange}
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </InputGroup>
                      </td>
                    </tr>
                    <tr className="border-top">
                      <th className="h4">Total:</th>
                      <td className="text-end h4 text-success">
                        {calcularTotal().toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                    </tr>
                  </tbody>
                </Table>
                
                <div className="d-grid gap-2 mt-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {id ? 'Atualizar Venda' : 'Finalizar Venda'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => navigate('/vendas')}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default VendaForm;