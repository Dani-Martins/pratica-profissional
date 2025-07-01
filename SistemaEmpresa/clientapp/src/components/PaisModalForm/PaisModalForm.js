import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  Alert,
  ListGroupItem
} from 'reactstrap';
import PaisService from '../../api/services/paisService';

const PaisQuickAddModal = ({ isOpen, toggle, onPaisSaved, onSaved }) => {
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    codigo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const novoPais = await PaisService.create(formData);
      
      // Resetar o formulário
      setFormData({
        nome: '',
        sigla: '',
        codigo: ''
      });
      
      // Alteração aqui - verificar ambas as props por compatibilidade
      if (onSaved) {
        onSaved(novoPais);
      } else if (onPaisSaved) {
        onPaisSaved(novoPais);
      }
      
      // Fechar o modal
      toggle();
    } catch (error) {
      console.error('Erro ao salvar país:', error);
      setError('Ocorreu um erro ao salvar o país. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Cadastrar Novo País</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger" timeout={500}>{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="nome">Nome do País</Label>
            <Input 
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="sigla">Sigla</Label>
            <Input 
              type="text"
              id="sigla"
              name="sigla"
              value={formData.sigla}
              onChange={handleChange}
              required
              maxLength={5}
              placeholder="Ex: BR, US, JP"
            />
          </FormGroup>
          
          <FormGroup>
            <Label for="codigo">Código</Label>
            <Input 
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              maxLength={5}
              placeholder="Ex: 55, 1, 81"
            />
          </FormGroup>
          
          <div className="d-flex justify-content-end">
            <Button 
              color="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar País'}
            </Button>
          </div>
        </Form>
        <ListGroupItem>
          <strong>Código Telefônico:</strong> {formData.codigo ? `+${formData.codigo}` : 'Não informado'}
        </ListGroupItem>
      </ModalBody>
    </Modal>
  );
};

export default PaisQuickAddModal;