import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardBody, Form, FormGroup, Label, Input, 
  Button, Alert, Spinner, Row, Col, Table,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faArrowLeft, faTimes, faFileInvoice,
  faUser, faShoppingCart, faTruck, faDollarSign
} from '@fortawesome/free-solid-svg-icons';

// Schema de validação
const NotaFiscalSchema = Yup.object().shape({
  clienteId: Yup.number()
    .required('Cliente é obrigatório'),
  transportadoraId: Yup.number()
    .nullable(),
  formaPagamentoId: Yup.number()
    .required('Forma de pagamento é obrigatória'),
  condicaoPagamentoId: Yup.number()
    .required('Condição de pagamento é obrigatória'),
  modalidadeNfeId: Yup.number()
    .required('Modalidade de NFe é obrigatória'),
  observacoes: Yup.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres'),
  itens: Yup.array()
    .min(1, 'Adicione pelo menos um item à nota fiscal')
    .of(Yup.object().shape({
      produtoId: Yup.number().required('Produto é obrigatório'),
      quantidade: Yup.number().required('Quantidade é obrigatória').positive('Quantidade deve ser positiva'),
      valorUnitario: Yup.number().required('Valor unitário é obrigatório').positive('Valor unitário deve ser positivo'),
      desconto: Yup.number().min(0, 'Desconto não pode ser negativo')
    }))
});

const NotaFiscalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [clientes, setClientes] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [modalidadesNfe, setModalidadesNfe] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [initialValues, setInitialValues] = useState({
    clienteId: '',
    transportadoraId: '',
    formaPagamentoId: '',
    condicaoPagamentoId: '',
    modalidadeNfeId: '',
    observacoes: '',
    frete: 0,
    seguro: 0,
    despesasAdicionais: 0,
    itens: [],
    totalProdutos: 0,
    totalDescontos: 0,
    totalNota: 0,
    novoProdutoId: '',
    novaQuantidade: '',
    novoValorUnitario: '',
    novoDesconto: ''
  });
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de dados
        setTimeout(() => {
          // Clientes simulados
          setClientes([
            { id: 1, nome: 'Cliente A' },
            { id: 2, nome: 'Cliente B' },
            { id: 3, nome: 'Cliente C' }
          ]);
          
          // Transportadoras simuladas
          setTransportadoras([
            { id: 1, nome: 'Transportadora A' },
            { id: 2, nome: 'Transportadora B' },
            { id: 3, nome: 'Transportadora C' }
          ]);
          
          // Formas de pagamento simuladas
          setFormasPagamento([
            { id: 1, nome: 'Dinheiro' },
            { id: 2, nome: 'Cartão de Crédito' },
            { id: 3, nome: 'Boleto Bancário' },
            { id: 4, nome: 'PIX' }
          ]);
          
          // Condições de pagamento simuladas
          setCondicoesPagamento([
            { id: 1, nome: 'À Vista' },
            { id: 2, nome: '30 dias' },
            { id: 3, nome: '30/60/90 dias' },
            { id: 4, nome: '15/30/45/60 dias' }
          ]);
          
          // Modalidades NFE simuladas
          setModalidadesNfe([
            { id: 1, nome: 'Venda de Mercadoria' },
            { id: 2, nome: 'Devolução de Mercadoria' },
            { id: 3, nome: 'Transferência' },
            { id: 4, nome: 'Remessa para Conserto' }
          ]);
          
          // Produtos simulados
          setProdutos([
            { id: 1, nome: 'Produto A', precoVenda: 150.00, estoque: 100 },
            { id: 2, nome: 'Produto B', precoVenda: 75.50, estoque: 50 },
            { id: 3, nome: 'Produto C', precoVenda: 200.00, estoque: 30 },
            { id: 4, nome: 'Produto D', precoVenda: 45.00, estoque: 200 },
            { id: 5, nome: 'Produto E', precoVenda: 350.00, estoque: 10 }
          ]);
          
          // Se for edição, carregar dados da nota fiscal
          if (id) {
            setInitialValues({
              clienteId: 1,
              transportadoraId: 2,
              formaPagamentoId: 3,
              condicaoPagamentoId: 2,
              modalidadeNfeId: 1,
              observacoes: 'Nota fiscal de teste',
              frete: 50.00,
              seguro: 25.00,
              despesasAdicionais: 15.00,
              itens: [
                {
                  id: 1,
                  produtoId: 1,
                  produto: 'Produto A',
                  quantidade: 2,
                  valorUnitario: 150.00,
                  desconto: 20.00,
                  total: 280.00
                },
                {
                  id: 2,
                  produtoId: 3,
                  produto: 'Produto C',
                  quantidade: 1,
                  valorUnitario: 200.00,
                  desconto: 0,
                  total: 200.00
                }
              ],
              totalProdutos: 500.00,
              totalDescontos: 20.00,
              totalNota: 570.00,
              novoProdutoId: '',
              novaQuantidade: '',
              novoValorUnitario: '',
              novoDesconto: ''
            });
          }
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const toggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Preparar dados para envio
      const notaFiscalData = {
        clienteId: parseInt(values.clienteId),
        transportadoraId: values.transportadoraId ? parseInt(values.transportadoraId) : null,
        formaPagamentoId: parseInt(values.formaPagamentoId),
        condicaoPagamentoId: parseInt(values.condicaoPagamentoId),
        modalidadeNfeId: parseInt(values.modalidadeNfeId),
        observacoes: values.observacoes,
        frete: parseFloat(values.frete),
        seguro: parseFloat(values.seguro),
        despesasAdicionais: parseFloat(values.despesasAdicionais),
        itens: values.itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto || 0
        }))
      };
      
      if (id) {
        // await NotaFiscalService.update(id, notaFiscalData);
        console.log('Atualizando nota fiscal:', notaFiscalData);
      } else {
        // await NotaFiscalService.create(notaFiscalData);
        console.log('Criando nota fiscal:', notaFiscalData);
      }
      
      navigate('/notas-fiscais');
    } catch (err) {
      setError('Erro ao salvar nota fiscal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleAddItem = (values, setValues) => {
    if (!values.novoProdutoId || values.novaQuantidade <= 0) return;
    
    const produto = produtos.find(p => p.id === parseInt(values.novoProdutoId));
    if (!produto) return;
    
    const novoItem = {
      id: Date.now(),
      produtoId: parseInt(values.novoProdutoId),
      produto: produto.nome,
      quantidade: parseFloat(values.novaQuantidade),
      valorUnitario: parseFloat(values.novoValorUnitario || produto.precoVenda),
      desconto: parseFloat(values.novoDesconto || 0),
      total: parseFloat(values.novaQuantidade) * parseFloat(values.novoValorUnitario || produto.precoVenda) - parseFloat(values.novoDesconto || 0)
    };
    
    const novosItens = [...values.itens, novoItem];
    const totalProdutos = novosItens.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    const totalDescontos = novosItens.reduce((sum, item) => sum + (item.desconto || 0), 0);
    const totalNota = totalProdutos - totalDescontos + parseFloat(values.frete) + parseFloat(values.seguro) + parseFloat(values.despesasAdicionais);
    
    setValues({
      ...values,
      itens: novosItens,
      totalProdutos,
      totalDescontos,
      totalNota,
      novoProdutoId: '',
      novaQuantidade: '',
      novoValorUnitario: '',
      novoDesconto: ''
    });
  };
  
  const handleRemoveItem = (itemId, values, setValues) => {
    const novosItens = values.itens.filter(item => item.id !== itemId);
    const totalProdutos = novosItens.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    const totalDescontos = novosItens.reduce((sum, item) => sum + (item.desconto || 0), 0);
    const totalNota = totalProdutos - totalDescontos + parseFloat(values.frete) + parseFloat(values.seguro) + parseFloat(values.despesasAdicionais);
    
    setValues({
      ...values,
      itens: novosItens,
      totalProdutos,
      totalDescontos,
      totalNota
    });
  };
  
  const handleProdutoChange = (e, setFieldValue) => {
    const produtoId = parseInt(e.target.value);
    if (produtoId) {
      const produto = produtos.find(p => p.id === produtoId);
      if (produto) {
        setFieldValue('novoProdutoId', produtoId);
        setFieldValue('novoValorUnitario', produto.precoVenda);
      }
    } else {
      setFieldValue('novoProdutoId', '');
      setFieldValue('novoValorUnitario', '');
    }
  };
  
  const handleValoresFreteChange = (e, setValues, values) => {
    const { name, value } = e.target;
    const valorNumerico = parseFloat(value) || 0;
    
    const totalNota = values.totalProdutos - values.totalDescontos + 
      (name === 'frete' ? valorNumerico : parseFloat(values.frete)) + 
      (name === 'seguro' ? valorNumerico : parseFloat(values.seguro)) + 
      (name === 'despesasAdicionais' ? valorNumerico : parseFloat(values.despesasAdicionais));
    
    setValues({
      ...values,
      [name]: valorNumerico,
      totalNota
    });
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados da nota fiscal...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
          {id ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
        </h2>
        <Button 
          color="secondary" 
          onClick={() => navigate('/notas-fiscais')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar
        </Button>
      </div>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={NotaFiscalSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue, setValues }) => (
              <Form onSubmit={handleSubmit}>
                <Nav tabs className="mb-4">
                  <NavItem>
                    <NavLink
                      className={activeTab === '1' ? 'active' : ''}
                      onClick={() => toggle('1')}
                    >
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Dados Gerais
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '2' ? 'active' : ''}
                      onClick={() => toggle('2')}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Produtos
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '3' ? 'active' : ''}
                      onClick={() => toggle('3')}
                    >
                      <FontAwesomeIcon icon={faTruck} className="me-2" />
                      Transporte
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '4' ? 'active' : ''}
                      onClick={() => toggle('4')}
                    >
                      <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                      Pagamento
                    </NavLink>
                  </NavItem>
                </Nav>
                
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="clienteId">Cliente*</Label>
                          <Input
                            type="select"
                            name="clienteId"
                            id="clienteId"
                            value={values.clienteId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.clienteId && !!errors.clienteId}
                          >
                            <option value="">Selecione...</option>
                            {clientes.map(cliente => (
                              <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                              </option>
                            ))}
                          </Input>
                          {touched.clienteId && errors.clienteId && (
                            <div className="text-danger">{errors.clienteId}</div>
                          )}
                        </FormGroup>
                      </Col>
                      
                      <Col md={6}>
                        <FormGroup>
                          <Label for="modalidadeNfeId">Modalidade NFe*</Label>
                          <Input
                            type="select"
                            name="modalidadeNfeId"
                            id="modalidadeNfeId"
                            value={values.modalidadeNfeId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.modalidadeNfeId && !!errors.modalidadeNfeId}
                          >
                            <option value="">Selecione...</option>
                            {modalidadesNfe.map(modalidade => (
                              <option key={modalidade.id} value={modalidade.id}>
                                {modalidade.nome}
                              </option>
                            ))}
                          </Input>
                          {touched.modalidadeNfeId && errors.modalidadeNfeId && (
                            <div className="text-danger">{errors.modalidadeNfeId}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <FormGroup>
                      <Label for="observacoes">Observações</Label>
                      <Input
                        type="textarea"
                        name="observacoes"
                        id="observacoes"
                        rows={3}
                        value={values.observacoes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.observacoes && !!errors.observacoes}
                      />
                      {touched.observacoes && errors.observacoes && (
                        <div className="text-danger">{errors.observacoes}</div>
                      )}
                    </FormGroup>
                  </TabPane>
                  
                  <TabPane tabId="2">
                    <Card className="mb-4">
                      <CardBody>
                        <Row className="mb-3">
                          <Col md={4}>
                            <FormGroup>
                              <Label for="novoProdutoId">Produto</Label>
                              <Input
                                type="select"
                                name="novoProdutoId"
                                id="novoProdutoId"
                                value={values.novoProdutoId || ''}
                                onChange={(e) => handleProdutoChange(e, setFieldValue)}
                              >
                                <option value="">Selecione...</option>
                                {produtos.map(produto => (
                                  <option key={produto.id} value={produto.id}>
                                    {produto.nome}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          
                          <Col md={2}>
                            <FormGroup>
                              <Label for="novaQuantidade">Quantidade</Label>
                              <Input
                                type="number"
                                name="novaQuantidade"
                                id="novaQuantidade"
                                min="0.01"
                                step="0.01"
                                value={values.novaQuantidade || ''}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          
                          <Col md={2}>
                            <FormGroup>
                              <Label for="novoValorUnitario">Valor Unitário</Label>
                              <Input
                                type="number"
                                name="novoValorUnitario"
                                id="novoValorUnitario"
                                min="0.01"
                                step="0.01"
                                value={values.novoValorUnitario || ''}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          
                          <Col md={2}>
                            <FormGroup>
                              <Label for="novoDesconto">Desconto</Label>
                              <Input
                                type="number"
                                name="novoDesconto"
                                id="novoDesconto"
                                min="0"
                                step="0.01"
                                value={values.novoDesconto || ''}
                                onChange={handleChange}
                              />
                            </FormGroup>
                          </Col>
                          
                          <Col md={2} className="d-flex align-items-end">
                            <Button
                              color="success"
                              className="w-100"
                              onClick={() => handleAddItem(values, setValues)}
                            >
                              Adicionar
                            </Button>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                    
                    <Table bordered responsive>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                          <th>Valor Unitário</th>
                          <th>Desconto</th>
                          <th>Total</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.itens.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              Nenhum item adicionado
                            </td>
                          </tr>
                        ) : (
                          values.itens.map(item => (
                            <tr key={item.id}>
                              <td>{item.produto}</td>
                              <td>{item.quantidade.toLocaleString('pt-BR')}</td>
                              <td>R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td>R$ {(item.desconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td>R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id, values, setValues)}
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan="4" className="text-end">Total de Produtos:</th>
                          <th>R$ {values.totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</th>
                          <th></th>
                        </tr>
                        <tr>
                          <th colSpan="4" className="text-end">Total de Descontos:</th>
                          <th>R$ {values.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </Table>
                    
                    {touched.itens && errors.itens && (
                      <Alert color="danger">{errors.itens}</Alert>
                    )}
                  </TabPane>
                  
                  <TabPane tabId="3">
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="transportadoraId">Transportadora</Label>
                          <Input
                            type="select"
                            name="transportadoraId"
                            id="transportadoraId"
                            value={values.transportadoraId || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">Selecione...</option>
                            {transportadoras.map(transportadora => (
                              <option key={transportadora.id} value={transportadora.id}>
                                {transportadora.nome}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      
                      <Col md={6}>
                        <FormGroup>
                          <Label for="frete">Valor do Frete</Label>
                          <Input
                            type="number"
                            name="frete"
                            id="frete"
                            min="0"
                            step="0.01"
                            value={values.frete}
                            onChange={(e) => handleValoresFreteChange(e, setValues, values)}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="seguro">Valor do Seguro</Label>
                          <Input
                            type="number"
                            name="seguro"
                            id="seguro"
                            min="0"
                            step="0.01"
                            value={values.seguro}
                            onChange={(e) => handleValoresFreteChange(e, setValues, values)}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      
                      <Col md={6}>
                        <FormGroup>
                          <Label for="despesasAdicionais">Despesas Adicionais</Label>
                          <Input
                            type="number"
                            name="despesasAdicionais"
                            id="despesasAdicionais"
                            min="0"
                            step="0.01"
                            value={values.despesasAdicionais}
                            onChange={(e) => handleValoresFreteChange(e, setValues, values)}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </TabPane>
                  
                  <TabPane tabId="4">
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="formaPagamentoId">Forma de Pagamento*</Label>
                          <Input
                            type="select"
                            name="formaPagamentoId"
                            id="formaPagamentoId"
                            value={values.formaPagamentoId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.formaPagamentoId && !!errors.formaPagamentoId}
                          >
                            <option value="">Selecione...</option>
                            {formasPagamento.map(forma => (
                              <option key={forma.id} value={forma.id}>
                                {forma.nome}
                              </option>
                            ))}
                          </Input>
                          {touched.formaPagamentoId && errors.formaPagamentoId && (
                            <div className="text-danger">{errors.formaPagamentoId}</div>
                          )}
                        </FormGroup>
                      </Col>
                      
                      <Col md={6}>
                        <FormGroup>
                          <Label for="condicaoPagamentoId">Condição de Pagamento*</Label>
                          <Input
                            type="select"
                            name="condicaoPagamentoId"
                            id="condicaoPagamentoId"
                            value={values.condicaoPagamentoId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched.condicaoPagamentoId && !!errors.condicaoPagamentoId}
                          >
                            <option value="">Selecione...</option>
                            {condicoesPagamento.map(condicao => (
                              <option key={condicao.id} value={condicao.id}>
                                {condicao.nome}
                              </option>
                            ))}
                          </Input>
                          {touched.condicaoPagamentoId && errors.condicaoPagamentoId && (
                            <div className="text-danger">{errors.condicaoPagamentoId}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Card className="bg-light p-3 mt-3">
                      <h5>Resumo Financeiro</h5>
                      <Row>
                        <Col md={4}>
                          <p className="mb-1">Total de Produtos:</p>
                          <h6>R$ {values.totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h6>
                        </Col>
                        <Col md={4}>
                          <p className="mb-1">Total de Descontos:</p>
                          <h6>R$ {values.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h6>
                        </Col>
                        <Col md={4}>
                          <p className="mb-1">Frete + Seguro + Despesas:</p>
                          <h6>R$ {(parseFloat(values.frete) + parseFloat(values.seguro) + parseFloat(values.despesasAdicionais)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h6>
                        </Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col>
                          <h4 className="text-end">Total da Nota: R$ {values.totalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                        </Col>
                      </Row>
                    </Card>
                  </TabPane>
                </TabContent>
                
                <div className="d-flex gap-2 mt-4">
                  <Button 
                    type="submit" 
                    color="primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    color="secondary" 
                    onClick={() => navigate('/notas-fiscais')}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancelar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotaFiscalForm;