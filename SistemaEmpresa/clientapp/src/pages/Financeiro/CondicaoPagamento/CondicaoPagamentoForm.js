import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, FormGroup, Label, Input, Button, Alert,
  Spinner, Row, Col, Table, CustomInput, InputGroup, InputGroupAddon,
  InputGroupText, FormFeedback
} from 'reactstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSearch } from '@fortawesome/free-solid-svg-icons';

const CondicaoPagamentoForm = () => {  // Estado inicial do formulário
  const estadoInicial = {
    codigo: '',  // Adicionando o campo obrigatório Codigo
    descricao: '',
    tipo: 'Parcelado',
    ativo: true,
    percentualJuros: 0,
    percentualMulta: 0,
    percentualDesconto: 0,
    parcelas: []
  };

  // Estados
  const [condicao, setCondicao] = useState(estadoInicial);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState('Nova Condição de Pagamento');
  const [sucessoMensagem, setSucessoMensagem] = useState(null);
  const [validacao, setValidacao] = useState({});

  // Estado para nova parcela
  const [novaParcela, setNovaParcela] = useState({
    numero: 1,
    dias: '',
    percentual: '',
    formaPagamentoId: ''
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdicao = !!id;

  useEffect(() => {
    carregarFormasPagamento();

    if (isEdicao) {
      setTitulo('Editar Condição de Pagamento');
      carregarCondicao(id);
    }
  }, [id]);

  const carregarFormasPagamento = async () => {
    try {
      const response = await axios.get('/api/FormaPagamento');
      setFormasPagamento(response.data);
    } catch (err) {
      console.error('Erro ao carregar formas de pagamento:', err);
      setError('Não foi possível carregar as formas de pagamento.');
    }
  }; const carregarCondicao = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/CondicaoPagamento/${id}`);
      const condicaoData = response.data;

      // Determinar se é À Vista ou Parcelado
      const isAVista = condicaoData.aVista;
      const tipo = isAVista ? 'À Vista' : 'Parcelado';

      // Obter as parcelas
      const parcelasResponse = await axios.get(`/api/ParcelaCondicaoPagamento/CondicaoPagamento/${id}`);
      let parcelas = parcelasResponse.data || [];

      // Para condições à vista, garantir que há exatamente uma parcela
      if (isAVista) {
        if (parcelas.length === 0) {
          // Se não houver parcelas, criamos uma padrão
          parcelas = [{
            numero: 1,
            dias: 0,
            percentual: 100,
            formaPagamentoId: formasPagamento.length > 0 ? formasPagamento[0].id.toString() : ''
          }];
        } else if (parcelas.length > 1) {
          // Se houver mais de uma parcela, mantemos apenas a primeira
          parcelas = [parcelas[0]];
          parcelas[0].percentual = 100;
        }
      }

      // Mapear do modelo de backend para o frontend
      setCondicao({
        ...condicaoData,
        tipo: tipo, // Convertendo aVista para o campo tipo do frontend
        parcelas: parcelas
      });
    } catch (err) {
      console.error('Erro ao carregar condição de pagamento:', err);
      setError('Não foi possível carregar os dados da condição de pagamento.');
    } finally {
      setLoading(false);
    }
  }; const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Verificar se está mudando o tipo (À Vista / Parcelado)
    if (name === 'tipo' && value === 'À Vista' && condicao.tipo !== 'À Vista') {
      // Se mudou para À Vista, vamos configurar uma parcela única de 100%
      // Tentamos preservar a forma de pagamento se já existir alguma parcela
      const formaPagamentoId = condicao.parcelas.length > 0
        ? condicao.parcelas[0].formaPagamentoId
        : (formasPagamento.length > 0 ? formasPagamento[0].id.toString() : '');

      const parcelas = [{
        numero: 1,
        dias: 0,
        percentual: 100,
        formaPagamentoId: formaPagamentoId
      }];

      setCondicao({
        ...condicao,
        tipo: value,
        parcelas: parcelas
      });
    } else if (name === 'tipo' && value !== 'À Vista' && condicao.tipo === 'À Vista') {
      // Se mudou de À Vista para Parcelado, limpa as parcelas para forçar adicionar novas
      setCondicao({
        ...condicao,
        tipo: value,
        parcelas: []
      });
    } else {
      setCondicao({
        ...condicao,
        [name]: type === 'checkbox' ? checked : value
      });
    }

    // Limpa erros de validação ao editar
    if (validacao[name]) {
      setValidacao({
        ...validacao,
        [name]: null
      });
    }
  };

  const handleParcelaChange = (e) => {
    const { name, value } = e.target;
    setNovaParcela({
      ...novaParcela,
      [name]: value
    });
  };

  const adicionarParcela = () => {
    // Validação básica
    if (!novaParcela.dias || !novaParcela.percentual) {
      setValidacao({
        ...validacao,
        parcela: 'Dias e Percentual são obrigatórios'
      });
      return;
    }

    // Adiciona a nova parcela à lista
    const proximoNumero = condicao.parcelas.length + 1;
    const parcela = {
      ...novaParcela,
      numero: proximoNumero
    };

    setCondicao({
      ...condicao,
      parcelas: [...condicao.parcelas, parcela]
    });

    // Limpa o formulário de nova parcela
    setNovaParcela({
      numero: proximoNumero + 1,
      dias: '',
      percentual: '',
      formaPagamentoId: ''
    });

    setValidacao({
      ...validacao,
      parcela: null
    });
  };

  const removerParcela = (index) => {
    const novasParcelas = [...condicao.parcelas];
    novasParcelas.splice(index, 1);

    // Reajustar os números
    const parcelasAtualizadas = novasParcelas.map((p, idx) => ({
      ...p,
      numero: idx + 1
    }));

    setCondicao({
      ...condicao,
      parcelas: parcelasAtualizadas
    });

    setNovaParcela({
      ...novaParcela,
      numero: parcelasAtualizadas.length + 1
    });
  }; const validarFormulario = () => {
    const erros = {};
    const isAVista = condicao.tipo === "À Vista";

    if (!condicao.codigo) {
      erros.codigo = 'Código é obrigatório';
    }

    if (!condicao.descricao) {
      erros.descricao = 'Descrição é obrigatória';
    }

    // Validação para condições à vista
    if (isAVista) {
      if (!condicao.parcelas || condicao.parcelas.length === 0 || !condicao.parcelas[0].formaPagamentoId) {
        erros.formaPagamento = 'É necessário selecionar uma forma de pagamento';
      }
    }
    // Validação de parcelas somente para condições parceladas
    else if (condicao.parcelas.length === 0) {
      erros.parcelas = 'É necessário adicionar pelo menos uma parcela';
    }

    // Verificar se o total de percentuais é 100%
    if (!isAVista && condicao.parcelas.length > 0) {
      const totalPercentual = condicao.parcelas.reduce(
        (soma, parcela) => soma + parseFloat(parcela.percentual || 0), 0
      );

      if (totalPercentual !== 100) {
        erros.percentualTotal = `O total dos percentuais deve ser 100%. Atual: ${totalPercentual}%`;
      }
    }

    setValidacao(erros);
    return Object.keys(erros).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let response;      // Verificar se é condição à vista ou parcelada
      const isAVista = condicao.tipo === "À Vista";

      // Se for à vista, garantimos que há uma parcela padrão
      if (isAVista) {
        // Garante que haja apenas uma parcela e que ela seja 100%
        if (!condicao.parcelas || condicao.parcelas.length === 0) {
          // Se não houver parcela, cria uma com forma de pagamento padrão
          condicao.parcelas = [{
            numero: 1,
            dias: 0,
            percentual: 100,
            formaPagamentoId: formasPagamento.length > 0 ? formasPagamento[0].id.toString() : '1'
          }];
        } else {
          // Atualiza a parcela existente para garantir que esteja correta
          const parcelaAVista = {
            numero: 1,
            dias: 0,
            percentual: 100,
            formaPagamentoId: condicao.parcelas[0].formaPagamentoId || (formasPagamento.length > 0 ? formasPagamento[0].id.toString() : '1')
          };
          condicao.parcelas = [parcelaAVista];
        }
      }

      // Dados para enviar à API - garantindo que os valores estão no formato esperado pelo backend
      const condicaoData = {
        codigo: condicao.codigo || "",
        descricao: condicao.descricao || "",
        aVista: isAVista, // Convertendo o campo tipo para aVista que o backend espera
        ativo: condicao.ativo === undefined ? true : condicao.ativo,
        percentualJuros: Number(condicao.percentualJuros || 0),
        percentualMulta: Number(condicao.percentualMulta || 0),
        percentualDesconto: Number(condicao.percentualDesconto || 0)
      };

      // Log para debug com JSON.stringify para ver exatamente o que está sendo enviado
      console.log('Enviando dados da condição de pagamento:', JSON.stringify(condicaoData));

      try {
        if (isEdicao) {
          // Atualizar condição existente
          // Enviar as parcelas junto no corpo do PUT
          response = await axios.put(`/api/CondicaoPagamento/${id}`, {
            ...condicaoData,
            parcelas: condicao.parcelas
          });
        } else {
          // Criar nova condição
          response = await axios.post('/api/CondicaoPagamento', {
            ...condicaoData,
            parcelas: condicao.parcelas
          });
        }
      } catch (postErr) {
        console.error('Erro ao salvar condição de pagamento:', postErr);
        console.error('Detalhes da resposta:', postErr.response?.data);
        if (postErr.response?.status === 400) {
          const validationErrors = postErr.response?.data?.errors || {};
          console.error('Erros de validação:', validationErrors);

          // Montar mensagem de erro mais detalhada
          let errorDetails = '';
          for (const field in validationErrors) {
            errorDetails += `${field}: ${validationErrors[field].join(', ')}\n`;
          }

          throw new Error(`Erro de validação: ${errorDetails || JSON.stringify(postErr.response?.data)}`);
        }
        throw postErr;
      }

      // ID da condição de pagamento criada/atualizada
      const condicaoId = isEdicao ? id : response?.data?.id;

      if (!condicaoId) {
        console.error('Resposta da API sem ID:', response?.data);
        throw new Error("Não foi possível obter o ID da condição de pagamento");
      }

      console.log('Condição de pagamento salva com ID:', condicaoId);
      setSucessoMensagem('Condição de pagamento salva com sucesso!');

      // Redirecionar após 1.5 segundo
      setTimeout(() => {
        navigate('/financeiro/condicoes-pagamento');
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar condição de pagamento:', err);

      // Extrair informações detalhadas do erro
      let errorMessage;

      if (err.response?.data) {
        // Tenta extrair mensagens de erro específicas da API
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          // Se houver erros de validação, exibe-os
          errorMessage = Object.entries(err.response.data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else {
        // Usa a mensagem padrão do erro
        errorMessage = err.message || 'Erro desconhecido ao salvar';
      }

      setError(`Erro ao salvar: ${errorMessage}`);
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
  } return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{titulo}</h2>
      </div>

      <Card className="p-4">        {error && <Alert color="danger" fade={true} timeout={300}>{error}</Alert>}
        {sucessoMensagem && (
          <Alert color="success">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            {sucessoMensagem}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>          <Row>
          <Col md={4}>
            <FormGroup>
              <Label for="codigo">Código*</Label>
              <Input
                type="text"
                id="codigo"
                name="codigo"
                value={condicao.codigo}
                onChange={handleInputChange}
                invalid={!!validacao.codigo}
                placeholder="Ex: VISTA, 30-60-90"
              />
              <FormFeedback>{validacao.codigo}</FormFeedback>
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup>
              <Label for="tipo">Tipo</Label>
              <Input
                type="select"
                id="tipo"
                name="tipo"
                value={condicao.tipo}
                onChange={handleInputChange}
              >
                <option value="À Vista">À Vista</option>
                <option value="Parcelado">Parcelado</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup>
              <Label for="descricao">Descrição*</Label>
              <Input
                type="text"
                id="descricao"
                name="descricao"
                value={condicao.descricao}
                onChange={handleInputChange}
                invalid={!!validacao.descricao}
                placeholder="Ex: 30/60/90"
              />
              <FormFeedback>{validacao.descricao}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
          {/* Situação será movida para o final do formulário */}

          <Row className="mt-3">
            <Col md={4}>
              <FormGroup>
                <Label for="percentualJuros">Juros (%)</Label>
                <InputGroup>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id="percentualJuros"
                    name="percentualJuros"
                    value={condicao.percentualJuros}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </FormGroup>
            </Col>

            <Col md={4}>
              <FormGroup>
                <Label for="percentualMulta">Multa (%)</Label>
                <InputGroup>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id="percentualMulta"
                    name="percentualMulta"
                    value={condicao.percentualMulta}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </FormGroup>
            </Col>

            <Col md={4}>
              <FormGroup>
                <Label for="percentualDesconto">Desconto (%)</Label>
                <InputGroup>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id="percentualDesconto"
                    name="percentualDesconto"
                    value={condicao.percentualDesconto}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </FormGroup>
            </Col>          </Row>

          <div className="mt-4">
            <h5 className="mb-3">Parcelas</h5>

            {validacao.parcelas && (
              <Alert color="danger" className="py-2" fade={true} timeout={300}>{validacao.parcelas}</Alert>
            )}

            {validacao.percentualTotal && (
              <Alert color="danger" className="py-2" fade={true} timeout={300}>{validacao.percentualTotal}</Alert>
            )}              {condicao.tipo === "À Vista" ? (
              // Interface simplificada para condições à vista
              <>
                <Alert color="info" className="py-2" fade={true} timeout={300}>
                  Condições do tipo "À Vista" terão uma parcela única com 100% do valor.
                </Alert>
                <Row className="mb-3">
                  <Col md={4}>
                    <FormGroup>
                      <Label>Forma de Pagamento</Label>
                      <Input
                        type="select"
                        value={condicao.parcelas.length > 0 ? condicao.parcelas[0]?.formaPagamentoId || '' : ''}
                        onChange={(e) => {
                          const parcelas = [...condicao.parcelas];
                          if (parcelas.length === 0) {
                            parcelas.push({
                              numero: 1,
                              dias: 0,
                              percentual: 100,
                              formaPagamentoId: e.target.value
                            });
                          } else {
                            parcelas[0] = {
                              ...parcelas[0],
                              formaPagamentoId: e.target.value
                            };
                          }
                          setCondicao({ ...condicao, parcelas });
                        }}
                        invalid={!!validacao.formaPagamento}
                      >
                        <option value="">Selecione uma forma de pagamento</option>
                        {formasPagamento.map(forma => (
                          <option key={forma.id} value={forma.id}>
                            {forma.descricao}
                          </option>
                        ))}
                      </Input>
                      <FormFeedback>{validacao.formaPagamento}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
              </>
            ) : (
              // Interface completa para condições parceladas
              <>
                <Row className="mb-3">
                  <Col md={3}>
                    <Input
                      type="number"
                      name="dias"
                      placeholder="Dias"
                      value={novaParcela.dias}
                      onChange={handleParcelaChange}
                    />
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      step="0.01"
                      name="percentual"
                      placeholder="Percentual"
                      value={novaParcela.percentual}
                      onChange={handleParcelaChange}
                    />
                  </Col>
                  <Col md={4}>
                    <Input
                      type="select"
                      name="formaPagamentoId"
                      value={novaParcela.formaPagamentoId}
                      onChange={handleParcelaChange}
                    >
                      <option value="">Selecione uma forma de pagamento</option>
                      {formasPagamento.map(forma => (
                        <option key={forma.id} value={forma.id}>
                          {forma.descricao}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={2} className="d-flex align-items-center">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={adicionarParcela}
                    >
                      Adicionar Parcela
                    </Button>
                  </Col>
                </Row>

                {validacao.parcela && (
                  <Row className="mt-2 mb-3">
                    <Col>
                      <div className="text-danger">
                        {validacao.parcela}
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}
            {/* Tabela de parcelas */}            {condicao.tipo !== "À Vista" && (
              <div className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>Dias</th>
                      <th>Percentual (%)</th>
                      <th>Forma de Pagamento</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {condicao.parcelas.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Nenhuma parcela adicionada
                        </td>
                      </tr>
                    ) : (
                      condicao.parcelas.map((parcela, index) => (
                        <tr key={index}>
                          <td>{parcela.dias}</td>
                          <td>{parcela.percentual}%</td>
                          <td>
                            {parcela.formaPagamentoId ?
                              formasPagamento.find(f => f.id === parseInt(parcela.formaPagamentoId))?.descricao || 'N/A'
                              : 'N/A'}
                          </td>
                          <td>
                            <Button
                              type="button"
                              color="danger"
                              size="sm"
                              onClick={() => removerParcela(index)}
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
            )}
          </div>            {/* Switch de Ativo/Inativo no padrão Cliente */}
          <Row className="mt-4">
            <Col md={12}>
              <FormGroup check className="mb-4 mt-2">
                <div className="form-check form-switch">
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="ativo"
                    role="switch"
                    name="ativo"
                    checked={!!condicao.ativo}
                    onChange={e => handleInputChange({ target: { name: 'ativo', type: 'checkbox', checked: e.target.checked } })}
                  />
                  <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                    Ativo <span style={{ fontWeight: 400 }}>
                      {!!condicao.ativo ? (
                        <span className="text-success">(Registro Ativo)</span>
                      ) : (
                        <span className="text-danger">(Registro Inativo)</span>
                      )}
                    </span>
                  </Label>
                </div>
              </FormGroup>
            </Col>
          </Row>

          {/* Botões no final do formulário - invertidos conforme solicitado */}
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
              onClick={() => navigate('/financeiro/condicoes-pagamento')}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>        </Form>
      </Card>
    </Container>
  );
};

export default CondicaoPagamentoForm;