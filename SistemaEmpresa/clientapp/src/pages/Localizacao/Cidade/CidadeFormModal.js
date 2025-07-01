import React, { useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { FormModal } from '../../../components/modals/ModalSystem';
import CidadeService from '../../../api/services/cidadeService';
import { useMessages } from '../../../contexts/MessageContext';
import EstadoSearchModal from '../Estado/EstadoSearchModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../Estado/estado-search-icon.css';
import './cidade-search-icon.css';

const CidadeFormModal = ({ isOpen, toggle, onSuccess }) => {  const [formData, setFormData] = useState({
    nome: '',
    estadoId: '',
    codigoIBGE: '' // Renomeado de codigoGeografico para codigoIBGE
  });
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [estadoModalOpen, setEstadoModalOpen] = useState(false);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.estadoId) {
      showError('Nome da cidade e Estado são obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      
      const cidadeData = {
        nome: formData.nome,
        estadoId: formData.estadoId,
        codigoIBGE: formData.codigoIBGE // Renomeado para usar o nome correto do campo
      };
      
      const novaCidade = await CidadeService.create(cidadeData);
      showSuccess('Cidade criada com sucesso!');
      
      if (onSuccess) {
        // Enriquecer o objeto da cidade com dados do estado para exibição
        const cidadeCompleta = {
          ...novaCidade,
          estadoNome: estadoSelecionado.nome,
          estadoUf: estadoSelecionado.uf,
          paisNome: estadoSelecionado.paisNome
        };
        onSuccess(cidadeCompleta);
      }
      
      // Resetar o formulário
      setFormData({ nome: '', estadoId: '', codigoIBGE: '' }); // Reset também do código
      setEstadoSelecionado(null);
      toggle();
    } catch (error) {
      showError('Erro ao criar cidade: ' + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEstadoSelect = (estado) => {
    if (!estado || !estado.id) {
      return;
    }
    
    setFormData(prev => ({ ...prev, estadoId: estado.id.toString() }));
    setEstadoSelecionado(estado);
  };

  return (
    <FormModal
      isOpen={isOpen}
      toggle={toggle}
      title="Cadastrar Cidade"
      onSubmit={handleSubmit}
      isProcessing={submitting}
    >
      <FormGroup>
        <Label for="nome">Cidade*</Label>
        <Input
          type="text"
          name="nome"
          id="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      {/* Código Geográfico movido para antes do Estado */}
      <FormGroup>
        <Label for="codigoIBGE">Código Geográfico</Label>
        <Input
          type="text"
          name="codigoIBGE" // Renomeado o name para codigoIBGE
          id="codigoIBGE"   // Renomeado o id também
          value={formData.codigoIBGE} // Usando o nome correto do campo no state
          onChange={handleChange}
          placeholder="Ex: 3550308 (IBGE)"
        />
        <small className="text-muted">Opcional. Código IBGE ou outro identificador geográfico padrão</small>
      </FormGroup>
      
      <FormGroup>
        <Label for="estadoId">Estado*</Label>
        <div className="d-flex align-items-center">
          <Input
            type="text"
            id="estadoExibicao"
            value={estadoSelecionado ? `${estadoSelecionado.nome} (${estadoSelecionado.uf}) - ${estadoSelecionado.paisNome}` : 'Nenhum estado selecionado'}
            disabled
            className="me-2"
            style={styles.campoSelecaoApenasLupa}
          />
          
          <Input
            type="hidden"
            name="estadoId"
            id="estadoId"
            value={formData.estadoId || ''}
          />
          
          <Button 
            className="search-btn-cadastro"
            onClick={() => setEstadoModalOpen(true)}
            title="Buscar estado"
          >
            <FontAwesomeIcon icon={faSearch} className="search-icon-visible" />
          </Button>
          
          <EstadoSearchModal 
            isOpen={estadoModalOpen}
            toggle={() => setEstadoModalOpen(!estadoModalOpen)}
            onSelect={handleEstadoSelect}
            renderButton={false}
          />
        </div>
      </FormGroup>
    </FormModal>
  );
};

export default CidadeFormModal;