import React, { useState, useEffect } from 'react';
import { Container, Card, Form, FormGroup, Label, Input, Button, Alert, Spinner, FormFeedback, Row, Col } from 'reactstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt-br';
import CustomAlert from '../../../components/CustomAlert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

// Configurar o momento para português brasileiro
moment.locale('pt-br');

const FormaPagamentoForm = () => {
  // Estado inicial do formulário
  const estadoInicial = {
    descricao: '',
    ativo: true,
    situacao: true,
    dataCriacao: null,
    dataAlteracao: null,
    userCriacao: '',
    userAtualizacao: ''
  };

  // Estados
  const [formaPagamento, setFormaPagamento] = useState(estadoInicial);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState('Nova Forma de Pagamento');
  const [sucessoMensagem, setSucessoMensagem] = useState(null);
  const [validacao, setValidacao] = useState({});

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdicao = !!id;

  useEffect(() => {
    if (isEdicao) {
      setTitulo('Editar Forma de Pagamento');
      carregarFormaPagamento(id);
    }
  }, [id]);  const carregarFormaPagamento = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/FormaPagamento/${id}`);
      console.log('Dados recebidos no form:', response.data);
      
      // Forçar situação para true
      console.log('Forçando situação para true');
      
      // Garantir que o campo ativo está presente para compatibilidade
      setFormaPagamento({
        ...response.data,
        situacao: true,
        ativo: true
      });
    } catch (err) {
      console.error('Erro ao carregar forma de pagamento:', err);
      setError('Não foi possível carregar os dados da forma de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const transformedValue = type === 'checkbox' ? checked : handleUpperCaseChange(name, value);
    
    setFormaPagamento({
      ...formaPagamento,
      [name]: transformedValue
    });

    // Limpa erros de validação ao editar
    if (validacao[name]) {
      setValidacao({
        ...validacao,
        [name]: null
      });
    }
  };

  const validarFormulario = () => {
    const erros = {};

    if (!formaPagamento.descricao) {
      erros.descricao = 'Descrição é obrigatória';
    }

    setValidacao(erros);
    return Object.keys(erros).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {      // Simplificar ao máximo - enviar apenas o que é estritamente necessário
      const dadosEnvio = {
        descricao: formaPagamento.descricao.trim(),
        situacao: 1,  // Forçar como 1 (byte) em vez de true (boolean)
        userCriacao: "Sistema"
      };
      
      console.log('Dados a serem enviados:', dadosEnvio);

      if (isEdicao) {        const dadosEdicao = {
          descricao: formaPagamento.descricao.trim(),
          situacao: 1,  // Forçar como 1 (byte) em vez de true (boolean)
          userAtualizacao: "Sistema"
        };
        await axios.put(`/api/FormaPagamento/${id}`, dadosEdicao);
      } else {
        try {
          console.log('Enviando para criar:', JSON.stringify(dadosEnvio));
          const response = await axios.post('/api/FormaPagamento', dadosEnvio);
          console.log('Resposta do servidor:', response.data);
        } catch (postError) {
          console.error('Erro detalhado ao salvar:', postError);
          
          // Detalhar todos os aspectos do erro para diagnóstico
          if (postError.response) {
            console.error('Erro response data:', postError.response.data);
            console.error('Erro response status:', postError.response.status);
            console.error('Erro response headers:', postError.response.headers);
          } else if (postError.request) {
            console.error('Erro request (sem resposta):', postError.request);
          } else {
            console.error('Erro na configuração:', postError.message);
          }
          
          throw postError;
        }
      }

      setSucessoMensagem('Forma de pagamento salva com sucesso!');

      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/financeiro/formas-pagamento');
      }, 1000);
    } catch (err) {
      console.error('Erro ao salvar forma de pagamento:', err);
      
      let mensagemErro = 'Erro ao salvar forma de pagamento';
      
      if (err.response) {
        // O servidor respondeu com um status de erro
        console.error('Erro do servidor:', err.response.data);
        console.error('Status do erro:', err.response.status);
        
        if (typeof err.response.data === 'string') {
          mensagemErro = `${mensagemErro}: ${err.response.data}`;
        } else if (err.response.data?.message) {
          mensagemErro = `${mensagemErro}: ${err.response.data.message}`;
        } else if (err.response.data?.title) {
          mensagemErro = `${mensagemErro}: ${err.response.data.title}`;
        }
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Erro na requisição (sem resposta):', err.request);
        mensagemErro = 'Erro ao comunicar com o servidor. Verifique sua conexão.';
      } else {
        // Algo aconteceu ao configurar a requisição
        console.error('Erro na configuração da requisição:', err.message);
        mensagemErro = `Erro: ${err.message}`;
      }
      
      setError(mensagemErro);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center p-5">
        <Spinner color="primary" />
      </Container>
    );
  }
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{titulo}</h2>
      </div>      <Card className="p-4">
        {error && <Alert color="danger" fade={false}>{error}</Alert>}
        {sucessoMensagem && (
          <CustomAlert
            color="success"
            message={<span><FontAwesomeIcon icon={faFloppyDisk} className="me-2" />{sucessoMensagem}</span>}
            autoDismiss={true}
            duration={5000}
          />
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="descricao">Descrição*</Label>
            <Input
              type="text"
              id="descricao"
              name="descricao"
              value={formaPagamento.descricao}
              onChange={handleInputChange}
              invalid={!!validacao.descricao}
              placeholder="Ex: Cartão de Crédito, Pix, Boleto, etc."
            />
            <FormFeedback>{validacao.descricao}</FormFeedback>
          </FormGroup>

          <FormGroup check className="mb-4 mt-2">
            <div className="form-check form-switch">
              <Input
                type="checkbox"
                className="form-check-input"
                id="ativo"
                role="switch"
                name="ativo"
                checked={!!formaPagamento.ativo}
                onChange={e => setFormaPagamento({ ...formaPagamento, ativo: e.target.checked })}
              />
              <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                Ativo <span style={{ fontWeight: 400 }}>
                  {!!formaPagamento.ativo ? (
                    <span className="text-success">(Registro Ativo)</span>
                  ) : (
                    <span className="text-danger">(Registro Inativo)</span>
                  )}
                </span>
              </Label>
            </div>
          </FormGroup>

          {/* Exibir informações de controle quando em modo de edição */}
          {isEdicao && formaPagamento.dataCriacao && (
            <div className="mt-4 pt-3 border-top">
              <Row>
                <Col md={6}>
                  <small className="text-muted d-block">
                    <strong>Criado por:</strong> {formaPagamento.userCriacao || 'Sistema'}
                  </small>
                  <small className="text-muted d-block">
                    <strong>Criado em:</strong> {moment(formaPagamento.dataCriacao).format('DD/MM/YYYY HH:mm')}
                  </small>
                </Col>
                {formaPagamento.dataAlteracao && (
                  <Col md={6}>
                    <small className="text-muted d-block">
                      <strong>Atualizado por:</strong> {formaPagamento.userAtualizacao || 'Sistema'}
                    </small>
                    <small className="text-muted d-block">
                      <strong>Atualizado em:</strong> {moment(formaPagamento.dataAlteracao).format('DD/MM/YYYY HH:mm')}
                    </small>
                  </Col>
                )}
              </Row>
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button
              type="submit"
              color="primary"
              className="me-2"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : 'Salvar'}
            </Button>
            <Button
              type="button"
              color="secondary"
              onClick={() => navigate('/financeiro/formas-pagamento')}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default FormaPagamentoForm;