import React, { useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { FormModal } from '../../../components/modals/ModalSystem';
import EstadoService from '../../../api/services/estadoService';
import { useMessages } from '../../../contexts/MessageContext';
import PaisSearchModal from '../Pais/PaisSearchModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

const EstadoModalForm = ({ isOpen, toggle, onSuccess }) => {  const [formData, setFormData] = useState({
    nome: '',
    uf: '',
    paisId: ''
  });
  const [paisSelecionado, setPaisSelecionado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paisModalOpen, setPaisModalOpen] = useState(false);
  const { showSuccess, showError } = useMessages();

  // Estilos para campos de seleção
  const styles = {
    campoSelecaoApenasLupa: {
      backgroundColor: '#f8f9fa',
      cursor: 'not-allowed'
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const transformedValue = handleUpperCaseChange(name, value);
    setFormData(prev => ({ ...prev, [name]: transformedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.uf || !formData.paisId) {
      showError('Nome, UF e País são obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      
      const estadoData = {
        nome: formData.nome,
        uf: formData.uf.toUpperCase(),
        paisId: formData.paisId
      };
      
      const novoEstado = await EstadoService.create(estadoData);
      showSuccess('Estado criado com sucesso!');
      
      if (onSuccess) {
        // Enriquecer o objeto do estado com dados do país para exibição
        const estadoCompleto = {
          ...novoEstado,
          paisNome: paisSelecionado.nome
        };
        onSuccess(estadoCompleto);
      }
      
      // Resetar o formulário
      setFormData({ nome: '', uf: '', paisId: '' });
      setPaisSelecionado(null);
      toggle();
    } catch (error) {
      showError('Erro ao criar estado: ' + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaisSelect = (pais) => {
    if (!pais || !pais.id) {
      return;
    }
    
    setFormData(prev => ({ ...prev, paisId: pais.id.toString() }));
    setPaisSelecionado(pais);
  };

  return (
    <FormModal
      isOpen={isOpen}
      toggle={toggle}
      title="Cadastrar Estado"
      onSubmit={handleSubmit}
      isProcessing={submitting}
    >
      <FormGroup>
        <Label for="nome">Estado*</Label>
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
        <Label for="uf">UF/Sigla*</Label>
        <Input
          type="text"
          name="uf"
          id="uf"
          value={formData.uf}
          onChange={handleChange}
          required
          maxLength={5}
          placeholder="Ex: SP, RJ, MG, QC, ON, etc."
        />
        <small className="form-text text-muted">
          UF para estados brasileiros ou sigla para regiões/províncias de outros países
        </small>
      </FormGroup>
        <FormGroup>
        <Label for="paisId">País*</Label>
        <div className="d-flex align-items-center">
          <Input
            type="text"
            id="paisExibicao"
            value={paisSelecionado ? `${paisSelecionado.nome} (${paisSelecionado.sigla})` : 'Nenhum país selecionado'}
            disabled
            className="me-2"
            style={styles.campoSelecaoApenasLupa}
          />
          
          <Input
            type="hidden"
            name="paisId"
            id="paisId"
            value={formData.paisId || ''}
          />
          
          <Button 
            className="search-btn-cadastro"
            onClick={() => setPaisModalOpen(true)}
            title="Buscar país"
          >
            <FontAwesomeIcon icon={faSearch} className="search-icon-visible" />
          </Button>
          
          <PaisSearchModal 
            isOpen={paisModalOpen}
            toggle={() => setPaisModalOpen(!paisModalOpen)}
            onSelect={handlePaisSelect}
            renderButton={false}
          />
        </div>
      </FormGroup>
    </FormModal>
  );
};

export default EstadoModalForm;