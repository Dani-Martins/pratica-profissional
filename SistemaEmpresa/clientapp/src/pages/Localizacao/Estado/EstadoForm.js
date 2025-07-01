import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, InputGroup, InputGroupText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import EstadoService from '../../../api/services/estadoService';
import PaisService from '../../../api/services/paisService';
import PaisModalForm from '../../../components/PaisModalForm/PaisModalForm';
import PaisSearchModal from '../Pais/PaisSearchModal';
import { useMessages } from '../../../contexts/MessageContext';
import SearchButton from '../../../components/buttons/SearchButton';

const EstadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
    const [formData, setFormData] = useState({
    nome: '',
    uf: '',
    paisId: '',
    situacao: true,
    userCriacao: 'SISTEMA',
    userAtualizacao: null
  });
  
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);  const [paisModalOpen, setPaisModalOpen] = useState(false);
  const [paisSearchModalOpen, setPaisSearchModalOpen] = useState(false);
  const [paisSelecionado, setPaisSelecionado] = useState(null); // Estado para o país selecionado

  // Adicione o hook de mensagens
  const { showSuccess, showError } = useMessages();

  // Carregar lista de países para o dropdown
  const fetchPaises = async () => {
    try {
      const data = await PaisService.getAll();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      setError('Erro ao carregar a lista de países.');
    }
  };

  useEffect(() => {
    fetchPaises();
  }, []);

  // Buscar dados do estado se for edição
  useEffect(() => {
    if (!isNew) {
      const fetchEstado = async () => {
        try {
          setLoading(true);
          const estadoData = await EstadoService.getById(id);          setFormData({
            nome: estadoData.nome,
            uf: estadoData.uf,
            paisId: estadoData.paisId.toString(),
            situacao: estadoData.situacao !== undefined ? estadoData.situacao : true,
            userCriacao: estadoData.userCriacao || 'SISTEMA',
            userAtualizacao: estadoData.userAtualizacao || null
          });
          setError(null);
        } catch (error) {
          console.error('Erro ao buscar estado:', error);
          setError('Não foi possível carregar os dados do estado.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchEstado();
    }
  }, [id, isNew]);

  // Use effect para carregar o país selecionado quando o componente inicializa com um ID existente
  useEffect(() => {
    if (formData.paisId && paises.length > 0) {
      const paisEncontrado = paises.find(p => p.id === parseInt(formData.paisId));
      if (paisEncontrado) {
        setPaisSelecionado(paisEncontrado);
      }
    }
  }, [formData.paisId, paises]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpar erros anteriores
    
    // Validação básica
    if (!formData.nome || !formData.nome.trim()) {
      setError('O nome do estado é obrigatório');
      return;
    }
    
    if (!formData.uf || !formData.uf.trim()) {
      setError('A UF/sigla do estado é obrigatória');
      return;
    }
    
    // Verificar se o país foi selecionado
    if (!formData.paisId) {
      setError('Selecione um país para o estado');
      return;
    }
    
    setLoading(true);
    setError(null);
      try {
      // Converter paisId para número
      const estadoData = {
        ...formData,
        paisId: parseInt(formData.paisId, 10),
        situacao: Boolean(formData.situacao),
        userCriacao: isNew ? 'SISTEMA' : formData.userCriacao,
        userAtualizacao: !isNew ? 'SISTEMA' : null
      };
      
      if (isNew) {
        await EstadoService.create(estadoData);
      } else {
        await EstadoService.update(id, estadoData);
      }
      
      setSuccess(true);
        // Navegar após breve delay
      setTimeout(() => {
        navigate('/localizacao/estados');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
      
      // Verificar se é erro de UF duplicada
      if (error.response && error.response.data && error.response.data.includes('UF')) {
        setError(error.response.data);
      } else {
        setError('Ocorreu um erro ao salvar o estado. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler para quando um novo país é salvo
  const handlePaisSaved = async (novoPais) => {
    // Recarregar a lista completa de países para obter o ID correto
    await fetchPaises();
    
    // Se o ID retornado for válido, selecione-o
    if (novoPais && novoPais.id > 0) {
      setFormData(prev => ({
        ...prev,
        paisId: novoPais.id.toString()
      }));
    } else {
      // Se o ID for inválido, tente encontrar o país pelo nome
      const paisesAtualizados = await PaisService.getAll();
      const paisEncontrado = paisesAtualizados.find(p => 
        p.nome.toUpperCase() === novoPais.nome.toUpperCase()
      );
      
      if (paisEncontrado) {
        setFormData(prev => ({
          ...prev,
          paisId: paisEncontrado.id.toString()
        }));
      }
    }
  };

  // Função para lidar com a seleção do país
  const handlePaisSelect = (pais) => {
    if (!pais || !pais.id) {
      return; // Silenciosamente ignorar seleções inválidas
    }
    
    setFormData(prev => ({ ...prev, paisId: pais.id.toString() }));
    setPaisSelecionado(pais);
    setError(null); // Limpar erros
  };
  
  return (
    <Card>      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            {isNew ? 'Novo Estado' : 'Editar Estado'}
          </h4>
          {/* Botão Voltar removido */}
        </div>
          {error && <Alert color="danger"><FontAwesomeIcon icon={faTimes} className="me-2" />{error}</Alert>}
        {success && <Alert color="success"><FontAwesomeIcon icon={faSave} className="me-2" />Estado salvo com sucesso!</Alert>}
        
        <Form onSubmit={handleSubmit}>          <FormGroup>
            <Label for="nome">Estado <span className="text-danger">*</span></Label>
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
            <Label for="uf">UF/SIGLA <span className="text-danger">*</span></Label>
            <Input 
              type="text"
              id="uf"
              name="uf"
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
            <Label for="paisId">País <span className="text-danger">*</span></Label>
            <div className="d-flex align-items-center">
              <Input
                type="text"
                id="paisExibicao"
                value={paisSelecionado ? `${paisSelecionado.nome} (${paisSelecionado.sigla})` : 'Nenhum país selecionado'}
                disabled
                className="me-2"
                style={styles.campoSelecaoApenasLupa}
              />
              
              {/* Campo oculto para armazenar o ID do país */}
              <Input
                type="hidden"
                name="paisId"
                id="paisId"
                value={formData.paisId || ''}              />
              
              {/* Botão de lupa para buscar país */}
              <SearchButton 
                onClick={() => setPaisSearchModalOpen(true)}
                title="Buscar país"
              />
              
              <PaisSearchModal
                isOpen={paisSearchModalOpen} 
                toggle={() => setPaisSearchModalOpen(!paisSearchModalOpen)}
                onSelect={handlePaisSelect}
                renderButton={false}
              />
            </div>
            {error && (
              <div className="text-danger">{error}</div>
            )}
          </FormGroup>
            <FormGroup check className="mb-4 mt-2">
  <div className="form-check form-switch">
    <Input
      type="checkbox"
      className="form-check-input"
      id="situacao"
      role="switch"
      name="situacao"
      checked={!!formData.situacao}
      onChange={e => setFormData({ ...formData, situacao: e.target.checked })}
    />
    <Label className="form-check-label" for="situacao" style={{ fontWeight: 700 }}>
      Ativo <span style={{ fontWeight: 400 }}>
        {!!formData.situacao ? (
          <span className="text-success">(Registro Ativo)</span>
        ) : (
          <span className="text-danger">(Registro Inativo)</span>
        )}
      </span>
    </Label>
  </div>
</FormGroup>
            <div className="d-flex justify-content-end mt-4">
            <Button 
              color="primary" 
              type="submit"
              className="me-2"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            
            <Button 
              color="secondary" 
              onClick={() => navigate('/localizacao/estados')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </Form>

        {/* Usar o componente existente em vez do novo */}
        <PaisModalForm 
          isOpen={paisModalOpen}
          toggle={() => setPaisModalOpen(!paisModalOpen)}
          onSaved={handlePaisSaved}
        />
      </CardBody>
    </Card>
  );
};
// Define styles as a JavaScript object
const styles = {
  campoSelecaoApenasLupa: {
    backgroundColor: '#f8f9fa',
    cursor: 'default'
  }
};

export default EstadoForm;