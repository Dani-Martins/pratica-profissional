import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardBody, Form, FormGroup, Label, Input, 
  Button, Row, Col, Alert, Spinner, InputGroup, InputGroupText 
} from 'reactstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTimes, faBarcode } from '@fortawesome/free-solid-svg-icons';
import ProdutoService from '../../api/services/produtoService';
import UnidadeMedidaSearchModal from './UnidadeMedida/UnidadeMedidaSearchModal';
import CategoriaSearchModal from './Categoria/CategoriaSearchModal';
import MarcaSearchModal from './Marca/MarcaSearchModal';
import SearchButton from '../../components/buttons/SearchButton';

// Schema de validação
const ProdutoSchema = Yup.object().shape({
  // Removido: codigo e preco
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
});

const ProdutoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);  const [initialValues, setInitialValues] = useState({
    // Removido: codigo, preco
    nome: '',
    descricao: '',
    estoque: 0,
    unidadeMedidaId: '',
    codigoBarras: '',
    referencia: '',
    marcaId: '',
    categoriaId: '',
    quantidadeMinima: '',
    valorCompra: '',
    valorVenda: '',
    quantidade: '',
    percentualLucro: '',
    observacoes: '',
    situacao: '',
    pesoLiquido: '',
    pesoBruto: '',
    ativo: true
  });
  const [error, setError] = useState(null);
  
  // Estados para modais de busca e seleção
  const [unidadeSearchOpen, setUnidadeSearchOpen] = useState(false);
  const [categoriaSearchOpen, setCategoriaSearchOpen] = useState(false);
  const [marcaSearchOpen, setMarcaSearchOpen] = useState(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);
  
  // Carregar dados do produto
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Se for edição, carrega o produto
        if (id) {
          try {
            const data = await ProdutoService.getById(id);
            setInitialValues(data);
            setLoading(false);
          } catch (error) {
            console.error("Erro ao carregar o produto:", error);
            setError("Não foi possível carregar os dados do produto");
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
        if (id) {
        await ProdutoService.update(id, values);
        console.log('Produto atualizado com sucesso:', values);
      } else {
        await ProdutoService.create(values);
        console.log('Produto criado com sucesso:', values);
      }
      
      navigate('/produtos');
    } catch (err) {
      setError('Erro ao salvar produto: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Funções para atualizar o campo após cadastro rápido
  const handleUnidadeSaved = (novaUnidade) => {
    setInitialValues((prev) => ({ ...prev, unidadeMedidaId: novaUnidade.id }));
    setUnidadeSearchOpen(false);
  };
  const handleCategoriaSaved = (novaCategoria) => {
    setInitialValues((prev) => ({ ...prev, categoriaId: novaCategoria.id }));
    setCategoriaSearchOpen(false);
  };
  const handleMarcaSaved = (novaMarca) => {
    setInitialValues((prev) => ({ ...prev, marcaId: novaMarca.id }));
    setMarcaSearchOpen(false);
  };
  
  // Atualizar seleção ao editar produto
  useEffect(() => {
    if (initialValues.unidadeMedidaId && !unidadeSelecionada) {
      // Buscar nome da unidade se necessário (pode ser otimizado)
    }
    if (initialValues.categoriaId && !categoriaSelecionada) {
      // Buscar nome da categoria se necessário
    }
    if (initialValues.marcaId && !marcaSelecionada) {
      // Buscar nome da marca se necessário
    }
  }, [initialValues]);

  // Handlers de seleção
  const handleUnidadeSelect = (unidade) => {
    setUnidadeSelecionada(unidade);
    setInitialValues((prev) => ({ ...prev, unidadeMedidaId: unidade.id }));
    setUnidadeSearchOpen(false);
  };
  const handleCategoriaSelect = (categoria) => {
    setCategoriaSelecionada(categoria);
    setInitialValues((prev) => ({ ...prev, categoriaId: categoria.id }));
    setCategoriaSearchOpen(false);
  };
  const handleMarcaSelect = (marca) => {
    setMarcaSelecionada(marca);
    setInitialValues((prev) => ({ ...prev, marcaId: marca.id }));
    setMarcaSearchOpen(false);
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Carregando dados do produto...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h2>{id ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={ProdutoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
                {/* Seção: Informações Básicas */}
                <h5 className="text-primary mb-3">Informações Básicas</h5>
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="nome">Produto<span className="text-danger">*</span></Label>
                      <Input
                        type="text"
                        name="nome"
                        id="nome"
                        value={values.nome}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        invalid={touched.nome && !!errors.nome}
                      />
                      {touched.nome && errors.nome && (
                        <div className="text-danger">{errors.nome}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="descricao">Descrição</Label>
                      <Input
                        type="textarea"
                        name="descricao"
                        id="descricao"
                        rows={3}
                        value={values.descricao}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Seção: Detalhes do Produto */}
                <h5 className="text-primary mb-3 mt-4">Detalhes do Produto</h5>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="unidadeMedidaId">Unidade de Medida</Label>
                      <InputGroup>
                        <Input
                          type="text"
                          name="unidadeMedidaId"
                          id="unidadeMedidaId"
                          value={unidadeSelecionada ? unidadeSelecionada.unidadeMedidaNome : ''}
                          placeholder="Selecione a unidade"
                          readOnly
                        />
                        <SearchButton onClick={() => setUnidadeSearchOpen(true)} title="Buscar Unidade de Medida" />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="marcaId">Marca</Label>
                      <InputGroup>
                        <Input
                          type="text"
                          name="marcaId"
                          id="marcaId"
                          value={marcaSelecionada ? marcaSelecionada.marcaNome : ''}
                          placeholder="Selecione a marca"
                          readOnly
                        />
                        <SearchButton onClick={() => setMarcaSearchOpen(true)} title="Buscar Marca" />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="categoriaId">Categoria</Label>
                      <InputGroup>
                        <Input
                          type="text"
                          name="categoriaId"
                          id="categoriaId"
                          value={categoriaSelecionada ? categoriaSelecionada.categoriaNome : ''}
                          placeholder="Selecione a categoria"
                          readOnly
                        />
                        <SearchButton onClick={() => setCategoriaSearchOpen(true)} title="Buscar Categoria" />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="codigoBarras">Código de Barras</Label>
                      <Input
                        type="text"
                        name="codigoBarras"
                        id="codigoBarras"
                        value={values.codigoBarras}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="referencia">Referência</Label>
                      <Input
                        type="text"
                        name="referencia"
                        id="referencia"
                        value={values.referencia}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="quantidadeMinima">Quantidade Mínima</Label>
                      <Input
                        type="number"
                        name="quantidadeMinima"
                        id="quantidadeMinima"
                        value={values.quantidadeMinima}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="valorCompra">Valor de Compra</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="valorCompra"
                        id="valorCompra"
                        value={values.valorCompra}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="valorVenda">Valor de Venda</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="valorVenda"
                        id="valorVenda"
                        value={values.valorVenda}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="quantidade">Quantidade</Label>
                      <Input
                        type="number"
                        name="quantidade"
                        id="quantidade"
                        value={values.quantidade}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="percentualLucro">% Lucro</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="percentualLucro"
                        id="percentualLucro"
                        value={values.percentualLucro}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Seção: Observações */}
                <h5 className="text-primary mb-3 mt-4">Observações</h5>
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Input
                        type="textarea"
                        name="observacoes"
                        id="observacoes"
                        rows={4}
                        value={values.observacoes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Adicione observações sobre o produto"
                        style={{ minHeight: '100px' }}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Status */}
                <Row className="mt-3">
                  <Col md={12}>
                    <FormGroup check className="mb-4 mt-2">
                      <div className="form-check form-switch">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="ativo"
                          role="switch"
                          name="ativo"
                          checked={values.ativo}
                          onChange={handleChange}
                        />
                        <Label className="form-check-label" for="ativo">
                          <strong>Ativo</strong> {values.ativo ? 
                            <span className="text-success">(Registro Ativo)</span> : 
                            <span className="text-danger">(Registro Inativo)</span>}
                        </Label>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Botões */}
                <div className="d-flex justify-content-end gap-2 mt-4">
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
                    onClick={() => navigate('/produtos')}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancelar
                  </Button>
                </div>
                <UnidadeMedidaSearchModal isOpen={unidadeSearchOpen} toggle={() => setUnidadeSearchOpen(false)} onSelect={handleUnidadeSelect} />
                <CategoriaSearchModal isOpen={categoriaSearchOpen} toggle={() => setCategoriaSearchOpen(false)} onSelect={handleCategoriaSelect} />
                <MarcaSearchModal isOpen={marcaSearchOpen} toggle={() => setMarcaSearchOpen(false)} onSelect={handleMarcaSelect} />
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProdutoForm;