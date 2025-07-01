import React, { useState } from 'react';
import { FormGroup, Label, Input, Button, Row, Col, FormFeedback } from 'reactstrap';
import { FormModal } from '../../../components/modals/ModalSystem';
import { useDataContext } from '../../../contexts/DataContext';
import { useMessages } from '../../../contexts/MessageContext';
import { transformToUpperCase, handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

// Opções para o tipo de CNH
const tiposCNH = [
  { value: 'A', label: 'A - Motos' },
  { value: 'B', label: 'B - Carros' },
  { value: 'C', label: 'C - Carros e pequenos caminhões' },
  { value: 'D', label: 'D - Ônibus' },
  { value: 'E', label: 'E - Caminhões pesados' },
  { value: 'AB', label: 'AB - Motos e Carros' },
  { value: 'AC', label: 'AC - Motos, Carros e pequenos caminhões' },
  { value: 'AD', label: 'AD - Motos, Carros e Ônibus' },
  { value: 'AE', label: 'AE - Motos e Caminhões pesados' }
];

const FuncaoFuncionarioFormModal = ({ isOpen, toggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    funcaoFuncionarioNome: '',
    descricao: '',
    cargahoraria: '',
    requercnh: false,
    tipoCNHRequerido: '',
    ativo: true,
    observacao: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { apiClient } = useDataContext();
  const { showSuccess, showError } = useMessages();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        // Limpar tipoCNHRequerido se requercnh for desmarcado
        tipoCNHRequerido: name === 'requercnh' && !checked ? '' : prev.tipoCNHRequerido
      }));
    } else {
      // Se for um campo de texto, transforma para maiúsculo
      if (type === 'text') {
        const transformedValue = transformToUpperCase(value);
        setFormData(prev => ({ ...prev, [name]: transformedValue }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }

    // Limpar erros ao editar campo
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.funcaoFuncionarioNome.trim()) {
      newErrors.funcaoFuncionarioNome = 'Nome da função é obrigatório';
    }
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (formData.requercnh && !formData.tipoCNHRequerido) {
      newErrors.tipoCNHRequerido = 'Tipo de CNH é obrigatório quando "Requer CNH" está marcado';
    }
    
    // Validar carga horária se preenchida
    if (formData.cargahoraria !== '' && isNaN(Number(formData.cargahoraria))) {
      newErrors.cargahoraria = 'Carga horária deve ser um número';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const funcaoData = {
        FuncaoFuncionarioNome: formData.funcaoFuncionarioNome.toUpperCase(),
        Descricao: formData.descricao.toUpperCase(),
        CargaHoraria: formData.cargahoraria ? Number(formData.cargahoraria) : null,
        RequerCNH: formData.requercnh,
        TipoCNHRequerido: formData.requercnh ? formData.tipoCNHRequerido.toUpperCase() : null,
        Ativo: formData.ativo,
        Observacao: formData.observacao ? formData.observacao.toUpperCase() : null
      };
      
      const response = await apiClient.post('/FuncaoFuncionario', funcaoData);
      showSuccess('Função criada com sucesso!');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Resetar o formulário
      setFormData({
        funcaoFuncionarioNome: '',
        descricao: '',
        cargahoraria: '',
        requercnh: false,
        tipoCNHRequerido: '',
        ativo: true,
        observacao: ''
      });
      toggle();
    } catch (error) {
      showError('Erro ao criar função: ' + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      toggle={toggle}
      title="Cadastrar Função de Funcionário"
      onSubmit={handleSubmit}
      isProcessing={submitting}
    >
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="funcaoFuncionarioNome">Nome da Função*</Label>
            <Input
              type="text"
              name="funcaoFuncionarioNome"
              id="funcaoFuncionarioNome"
              value={formData.funcaoFuncionarioNome}
              onChange={handleChange}
              invalid={!!errors.funcaoFuncionarioNome}
            />
            {errors.funcaoFuncionarioNome && (
              <FormFeedback>{errors.funcaoFuncionarioNome}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="descricao">Descrição*</Label>
            <Input
              type="text"
              name="descricao"
              id="descricao"
              value={formData.descricao}
              onChange={handleChange}
              invalid={!!errors.descricao}
            />
            {errors.descricao && (
              <FormFeedback>{errors.descricao}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="cargahoraria">Carga Horária</Label>
            <Input
              type="number"
              name="cargahoraria"
              id="cargahoraria"
              value={formData.cargahoraria}
              onChange={handleChange}
              invalid={!!errors.cargahoraria}
            />
            {errors.cargahoraria && (
              <FormFeedback>{errors.cargahoraria}</FormFeedback>
            )}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check className="mt-4">
            <Label check>
              <Input
                type="checkbox"
                name="requercnh"
                checked={formData.requercnh}
                onChange={handleChange}
              />
              Requer CNH
            </Label>
          </FormGroup>
        </Col>
      </Row>

      {formData.requercnh && (
        <Row>
          <Col md={12}>
            <FormGroup>
              <Label for="tipoCNHRequerido">Tipo de CNH Requerido*</Label>
              <Input
                type="select"
                name="tipoCNHRequerido"
                id="tipoCNHRequerido"
                value={formData.tipoCNHRequerido}
                onChange={handleChange}
                invalid={!!errors.tipoCNHRequerido}
              >
                <option value="">Selecione o tipo de CNH</option>
                {tiposCNH.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Input>
              {errors.tipoCNHRequerido && (
                <FormFeedback>{errors.tipoCNHRequerido}</FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
          <FormGroup check className="mt-2">
            <Label check>
              <Input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
              />
              Ativo
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <FormGroup className="mt-3">
            <Label for="observacao">Observações</Label>
            <Input
              type="textarea"
              name="observacao"
              id="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows="3"
            />
          </FormGroup>
        </Col>
      </Row>
    </FormModal>
  );
};

export default FuncaoFuncionarioFormModal;
