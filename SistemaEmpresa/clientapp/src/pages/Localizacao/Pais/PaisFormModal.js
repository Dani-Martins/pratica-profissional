import React, { useState } from 'react';
import { FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import { FormModal } from '../../../components/modals/ModalSystem';
import PaisService from '../../../api/services/paisService';
import { useMessages } from '../../../contexts/MessageContext';

const PaisFormModal = ({ isOpen, toggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    codigoTelefonico: '' // Adicionando o campo de código telefônico
  });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useMessages();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.sigla) {
      showError('Nome e sigla são obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      
      // Garantir que todos os campos estão sendo enviados para a API
      const paisData = {
        nome: formData.nome,
        sigla: formData.sigla,
        codigo: formData.codigoTelefonico || '', // Enviando como código (campo que o API espera)
        situacao: 1 // Adicionando situação ativa por padrão
      };
      
      // Logging para debug
      console.log('Enviando dados do país:', paisData);
      
      let novoPais = await PaisService.create(paisData);
      
      // Se o objeto retornado não tiver todos os dados necessários, busque novamente
      if (!novoPais || !novoPais.id) {
        console.log("Resposta da API incompleta, buscando país pelo nome");
        // Buscar o país pelo nome, assumindo que nome é único
        const todosPaises = await PaisService.getAll();
        novoPais = todosPaises.find(p => p.nome.toLowerCase() === formData.nome.toLowerCase());
      }
      
        console.log('País criado com sucesso:', novoPais);
      showSuccess('País criado com sucesso!');
      
      if (onSuccess && novoPais) {
        try {
          onSuccess(novoPais);
        } catch (callbackError) {
          console.error('Erro na função onSuccess:', callbackError);
        }
      } else {
        console.warn('onSuccess não chamado: função não fornecida ou país não criado');
      }
      
      // Resetar o formulário
      setFormData({ nome: '', sigla: '', codigoTelefonico: '' });
      toggle();
    } catch (error) {
      showError('Erro ao criar país: ' + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      toggle={toggle}
      title="Cadastrar País" // Alterar de "Novo País" para outro título se necessário
      onSubmit={handleSubmit}
      isProcessing={submitting}
    >
      <FormGroup>
        <Label for="nome">País*</Label>
        <Input
          type="text"
          name="nome"
          id="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label for="sigla">Sigla*</Label>
        <Input
          type="text"
          name="sigla"
          id="sigla"
          value={formData.sigla}
          onChange={handleChange}
          maxLength={3}
          required
        />
        <small className="text-muted">Ex: BR, US, JP (máximo 3 caracteres)</small>
      </FormGroup>

      <FormGroup>
        <Label for="codigoTelefonico">Código Telefônico</Label>
        <InputGroup>
          <InputGroupText>+</InputGroupText>
          <Input
            type="text"
            name="codigoTelefonico"
            id="codigoTelefonico"
            value={formData.codigoTelefonico}
            onChange={handleChange}
            placeholder="Ex: 55, 1, 81"
            maxLength={4}
          />
        </InputGroup>
        <small className="text-muted">Código DDI do país (sem o sinal +)</small>
      </FormGroup>
    </FormModal>
  );
};

export default PaisFormModal;