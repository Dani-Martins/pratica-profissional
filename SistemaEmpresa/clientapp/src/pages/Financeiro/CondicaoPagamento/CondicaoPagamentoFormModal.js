import React, { useState, useEffect } from 'react';
import { 
  FormGroup, Label, Input, Button, Row, Col, 
  Table, Badge, InputGroup, InputGroupText 
} from 'reactstrap';
import { FormModal } from '../../../components/modals/ModalSystem';
import CondicaoPagamentoService from '../../../api/services/condicaoPagamentoService';
import { FormaPagamentoService } from '../../../api/services/formaPagamentoService';
import { useMessages } from '../../../contexts/MessageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const CondicaoPagamentoFormModal = ({ isOpen, toggle, onSuccess }) => {  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'Parcelado',
    descricao: '',
    juros: 0,
    multa: 0,
    desconto: 0,
    parcelas: [],
    ativo: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [novaParcela, setNovaParcela] = useState({
    dias: '',
    percentual: '',
    formaPagamentoId: ''
  });
  const { showSuccess, showError } = useMessages();
  
  // Carregar formas de pagamento
  useEffect(() => {
    const carregarFormasPagamento = async () => {
      try {
        console.log('Carregando formas de pagamento...');
        // Sempre usar getAllAtivos para garantir que temos apenas formas ativas
        const response = await FormaPagamentoService.getAllAtivos();
        console.log('Formas de pagamento carregadas:', response);
        
        // Mesmo com os dados fixos, verificamos se recebemos algo
        if (!response || response.length === 0) {
          console.error('Nenhuma forma de pagamento disponível');
          showError('Erro ao carregar formas de pagamento. Por favor, tente novamente.');
          setFormasPagamento([]);
          return;
        }
        
        // Garantir que todas as formas tenham os campos necessários
        const formasNormalizadas = response.map(fp => ({
          ...fp,
          id: fp.id || Math.floor(Math.random() * 1000) + 100, // Garantir ID único se não tiver
          descricao: fp.descricao || 'Sem descrição',
          ativo: true // Todas as formas carregadas devem estar ativas
        }));
        
        console.log('Formas normalizadas para exibição:', formasNormalizadas);
        setFormasPagamento(formasNormalizadas);
      } catch (error) {
        console.error('Erro ao carregar formas de pagamento:', error);
        
        // Se houver erro, tentar usar os dados fixos diretamente
        try {
          console.log('Tentando usar formas de pagamento fixas...');
          if (FormaPagamentoService._formasPagamentoFixas) {
            const formasFixas = FormaPagamentoService._formasPagamentoFixas;
            console.log('Usando formas de pagamento fixas após erro:', formasFixas);
            setFormasPagamento(formasFixas);
          } else {
            throw new Error('Formas de pagamento fixas não disponíveis');
          }
        } catch (e) {
          console.error('Erro ao usar formas de pagamento fixas:', e);
          showError('Erro ao carregar formas de pagamento. Por favor, tente novamente.');
          setFormasPagamento([]);
        }
      }
    };
    
    if (isOpen) {
      carregarFormasPagamento();
    }
  }, [isOpen, showError]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valueToUse = type === 'checkbox' ? checked : value;
    
    if (name === 'juros' || name === 'multa' || name === 'desconto') {
      // Garantir que sejam números
      setFormData(prev => ({ ...prev, [name]: parseFloat(valueToUse) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: valueToUse }));
    }
  };
  
  const handleParcelaChange = (e) => {
    const { name, value } = e.target;
    setNovaParcela(prev => ({ 
      ...prev, 
      [name]: name === 'dias' || name === 'percentual' ? 
              (value ? parseFloat(value) : '') : 
              value 
    }));
  };  const adicionarParcela = () => {
    // Validações
    if (!novaParcela.dias && novaParcela.dias !== 0) {
      showError('Informe os dias para a parcela');
      return;
    }
    
    if (!novaParcela.percentual) {
      showError('Informe o percentual para a parcela');
      return;
    }
    
    if (!novaParcela.formaPagamentoId) {
      showError('Selecione uma forma de pagamento');
      return;
    }
    
    // Encontrar a forma de pagamento pelo ID
    console.log('Buscando forma de pagamento com ID:', novaParcela.formaPagamentoId);
    console.log('Formas disponíveis:', formasPagamento);
    
    const formaPagamentoSelecionada = formasPagamento.find(
      fp => fp.id && fp.id.toString() === novaParcela.formaPagamentoId.toString()
    );
    
    if (!formaPagamentoSelecionada) {
      console.error('Forma de pagamento não encontrada com ID:', novaParcela.formaPagamentoId);
      
      // Tentar encontrar por outro meio (em caso de inconsistência nos IDs)
      const formaReserva = formasPagamento[0]; // Usar a primeira forma como fallback
      
      if (formaReserva) {
        console.log('Usando forma de pagamento reserva:', formaReserva);
        
        // Adicionar nova parcela com a forma reserva
        const novaParcela2 = {
          ...novaParcela,
          id: Date.now(), // ID temporário para controle na interface
          formaPagamentoId: formaReserva.id,
          formaPagamento: formaReserva
        };
        
        console.log('Adicionando parcela com forma reserva:', novaParcela2);
        
        setFormData(prevData => ({
          ...prevData,
          parcelas: [...prevData.parcelas, novaParcela2]
        }));
        
        // Limpar campos
        setNovaParcela({
          dias: '',
          percentual: '',
          formaPagamentoId: ''
        });
        
        return;
      }
      
      showError('Forma de pagamento não encontrada. Por favor, selecione outra.');
      return;
    }
    
    // Adicionar nova parcela
    const novaParcela2 = {
      ...novaParcela,
      id: Date.now(), // ID temporário para controle na interface
      formaPagamento: formaPagamentoSelecionada
    };
    
    console.log('Adicionando parcela:', novaParcela2);
    
    setFormData(prevData => ({
      ...prevData,
      parcelas: [...prevData.parcelas, novaParcela2]
    }));
    
    // Limpar campos
    setNovaParcela({
      dias: '',
      percentual: '',
      formaPagamentoId: ''
    });
  };
  
  const removerParcela = (id) => {
    setFormData(prevData => ({
      ...prevData,
      parcelas: prevData.parcelas.filter(parcela => parcela.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo) {
      showError('Código da condição de pagamento é obrigatório');
      return;
    }
    
    if (!formData.descricao) {
      showError('Descrição da condição de pagamento é obrigatória');
      return;
    }

    if (formData.parcelas.length === 0) {
      showError('Adicione pelo menos uma parcela');
      return;
    }
    
    // Verificar se o total de percentuais é 100%
    const somaPercentuais = formData.parcelas.reduce((soma, parcela) => soma + parseFloat(parcela.percentual), 0);
    if (Math.abs(somaPercentuais - 100) > 0.01) { // Tolerância de 0.01 para erros de ponto flutuante
      showError(`O total dos percentuais deve ser 100%. Atual: ${somaPercentuais.toFixed(2)}%`);
      return;
    }

    try {
      setSubmitting(true);
        // Preparar dados para envio (transformar para o formato aceito pela API)
      const dadosEnvio = {
        codigo: formData.codigo,
        tipo: formData.tipo,
        descricao: formData.descricao,
        juros: formData.juros,
        multa: formData.multa,
        desconto: formData.desconto,
        parcelas: formData.parcelas.map(p => ({
          dias: p.dias,
          percentual: p.percentual,
          formaPagamentoId: p.formaPagamentoId || p.formaPagamento?.id
        })),
        ativo: formData.ativo
      };
      
      console.log('Enviando dados para criação:', dadosEnvio);
      
      const novaCondicao = await CondicaoPagamentoService.create(dadosEnvio);
      showSuccess('Condição de pagamento criada com sucesso!');
      
      if (onSuccess) {
        onSuccess(novaCondicao);
      }
      
      // Resetar o formulário
      setFormData({ 
        codigo: '',
        tipo: 'Parcelado',
        descricao: '',
        juros: 0,
        multa: 0,
        desconto: 0,
        parcelas: [],
        ativo: true
      });
      toggle();
    } catch (error) {
      showError('Erro ao criar condição de pagamento: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <FormModal
      isOpen={isOpen}
      toggle={toggle}
      title="Cadastrar Condição de Pagamento"
      onSubmit={handleSubmit}
      isProcessing={submitting}
      size="lg"
    >
      <Row>
        <Col md={4}>
          <FormGroup>
            <Label for="codigo">Código*</Label>
            <Input
              type="text"
              name="codigo"
              id="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              placeholder="Ex: VISTA, 30-60-90"
            />
          </FormGroup>
        </Col>
        
        <Col md={4}>
          <FormGroup>
            <Label for="tipo">Tipo</Label>
            <Input
              type="select"
              name="tipo"
              id="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="À Vista">À Vista</option>
              <option value="Parcelado">Parcelado</option>
              <option value="Especial">Especial</option>
            </Input>
          </FormGroup>
        </Col>
        
        <Col md={4}>
          <FormGroup>
            <Label for="descricao">Descrição*</Label>
            <Input
              type="text"
              name="descricao"
              id="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Ex: À Vista, 30/60/90 dias, etc."
            />
          </FormGroup>
        </Col>
      </Row>
      
      <Row className="mt-3">
        <Col md={4}>
          <FormGroup>
            <Label for="juros">Juros (%)</Label>
            <InputGroup>
              <Input
                type="number"
                name="juros"
                id="juros"
                value={formData.juros}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        
        <Col md={4}>
          <FormGroup>
            <Label for="multa">Multa (%)</Label>
            <InputGroup>
              <Input
                type="number"
                name="multa"
                id="multa"
                value={formData.multa}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        
        <Col md={4}>
          <FormGroup>
            <Label for="desconto">Desconto (%)</Label>
            <InputGroup>
              <Input
                type="number"
                name="desconto"
                id="desconto"
                value={formData.desconto}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
      
      <div className="mt-4 mb-2">
        <h5>Parcelas</h5>
      </div>
      
      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <FormGroup>
            <Label for="dias">Dias</Label>
            <Input
              type="number"
              name="dias"
              id="dias"
              value={novaParcela.dias}
              onChange={handleParcelaChange}
              min="0"
            />
          </FormGroup>
        </Col>
        
        <Col md={3}>
          <FormGroup>
            <Label for="percentual">Percentual (%)</Label>
            <InputGroup>
              <Input
                type="number"
                name="percentual"
                id="percentual"
                value={novaParcela.percentual}
                onChange={handleParcelaChange}
                min="0"
                max="100"
                step="0.01"
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        
        <Col md={4}>
          <FormGroup>
            <Label for="formaPagamentoId">Forma de Pagamento</Label>
            <Input
              type="select"
              name="formaPagamentoId"
              id="formaPagamentoId"
              value={novaParcela.formaPagamentoId}
              onChange={handleParcelaChange}
            >              <option value="">Selecione uma forma de pagamento</option>
              {formasPagamento && formasPagamento.length > 0 ? (
                formasPagamento.map(forma => (
                  <option key={forma.id} value={forma.id}>
                    {forma.descricao || `Forma ID: ${forma.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>Carregando formas de pagamento...</option>
              )}
            </Input>
          </FormGroup>
        </Col>
          <Col md={2} className="d-flex align-items-end mb-2">
          <Button 
            color="success" 
            onClick={adicionarParcela} 
            className="w-100"
            style={{ whiteSpace: 'nowrap', height: '38px' }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Adicionar
          </Button>
        </Col>
      </Row>
      
      <Table bordered striped responsive className="mt-3">
        <thead>
          <tr>
            <th>Dias</th>
            <th>Percentual (%)</th>
            <th>Forma de Pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {formData.parcelas.length > 0 ? (
            formData.parcelas.map(parcela => (
              <tr key={parcela.id}>
                <td>{parcela.dias}</td>
                <td>{parcela.percentual}%</td>
                <td>{parcela.formaPagamento?.descricao}</td>
                <td>
                  <Button 
                    color="danger" 
                    size="sm" 
                    onClick={() => removerParcela(parcela.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                Nenhuma parcela adicionada
              </td>
            </tr>
          )}
        </tbody>
        {formData.parcelas.length > 0 && (
          <tfoot>
            <tr>
              <th colSpan="1" className="text-end">Total:</th>
              <th>
                {formData.parcelas.reduce((sum, p) => sum + parseFloat(p.percentual || 0), 0).toFixed(2)}%
              </th>
              <th colSpan="2"></th>
            </tr>
          </tfoot>
        )}
      </Table>
      
      <FormGroup check className="mb-3 mt-4">
        <Input
          type="checkbox"
          name="ativo"
          id="ativo"
          checked={formData.ativo}
          onChange={handleChange}
        />
        <Label for="ativo" check>Ativo</Label>
      </FormGroup>
    </FormModal>
  );
};

export default CondicaoPagamentoFormModal;
