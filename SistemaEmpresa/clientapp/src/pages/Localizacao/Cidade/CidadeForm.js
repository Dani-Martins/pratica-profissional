import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import CidadeService from '../../../api/services/cidadeService';
import { useMessages } from '../../../contexts/MessageContext';
import EstadoSearchModal from '../Estado/EstadoSearchModal';
import EstadoModalForm from '../Estado/EstadoModalForm';

const CidadeForm = () => {  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  
  const [formData, setFormData] = useState({
    nome: '',
    estadoId: '',
    codigoIBGE: '', // Renomeado de codigoGeografico para codigoIBGE
    situacao: true // Adicionando campo de situação (ativo/inativo)
  });
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [estadoModalOpen, setEstadoModalOpen] = useState(false);
  const [estadoSearchModalOpen, setEstadoSearchModalOpen] = useState(false); // Novo estado para o modal de busca
  const { showSuccess, showError } = useMessages();
  
  // Estilos para campos de seleção
  const styles = {
    campoSelecaoApenasLupa: {
      backgroundColor: '#f8f9fa',
      cursor: 'not-allowed'
    }
  };

  useEffect(() => {
    if (!isNew) {
      const fetchCidade = async () => {
        try {          setLoading(true);
          const cidade = await CidadeService.getById(id);
          // Verifica se estadoId existe e converte para string apenas se não for nulo
          if (cidade) {
            setFormData({
              nome: cidade.nome,
              estadoId: cidade.estadoId ? cidade.estadoId.toString() : '',
              codigoIBGE: cidade.codigoIBGE || cidade.codigoIbge || '', // Verificando ambas as variações
              situacao: cidade.situacao !== undefined ? cidade.situacao : true // Definindo situação, padrão é ativo
            });
              // Carregar dados do estado selecionado apenas se estadoId for válido
            if (cidade.estadoId) {
              setEstadoSelecionado({
                id: cidade.estadoId,
                nome: cidade.estadoNome || '',
                uf: cidade.estadoUf || '',
                paisNome: cidade.paisNome || ''
              });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar cidade:', error);
          setError('Erro ao buscar dados da cidade.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCidade();
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!formData.nome || !formData.nome.trim()) {
      setError('O nome da cidade é obrigatório');
      return;
    }
    
    if (!formData.estadoId) {
      setError('Selecione um estado para a cidade');
      return;
    }
    
    try {
      setLoading(true);
        // Certifique-se de que o objeto enviado para o serviço tenha a propriedade CodigoIBGE no formato correto:
      const cidadeData = {
        id: isNew ? 0 : parseInt(id),
        nome: formData.nome,
        estadoId: parseInt(formData.estadoId),
        codigoIBGE: formData.codigoIBGE, // Certificando que o nome do campo está correto
        situacao: formData.situacao // Adicionando o campo situacao ao objeto
      };
      
      console.log('Enviando dados para o serviço:', cidadeData);
      
      // Se for create ou update
      if (isNew) {
        await CidadeService.create(cidadeData);
        showSuccess('Cidade criada com sucesso!');
      } else {
        await CidadeService.update(id, cidadeData);
        showSuccess('Cidade atualizada com sucesso!');
      }
      
      setSuccess(true);
      
      // Após mostrar sucesso, navegar de volta para a lista
      setTimeout(() => {
        navigate('/localizacao/cidades');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar cidade:', error);
      
      // Tratamento específico para erros de resposta da API
      if (error.response) {
        console.error('Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data
        });
        
        if (error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
          setError(`Erro de validação: ${errorMessages}`);
        } else {
          setError('Ocorreu um erro ao salvar a cidade. Por favor, verifique os dados e tente novamente.');
        }
      } else {
        setError('Ocorreu um erro ao salvar a cidade. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoSelect = (estado) => {
    if (!estado || !estado.id) {
      return;
    }
    
    setFormData(prev => ({ ...prev, estadoId: estado.id.toString() }));
    setEstadoSelecionado(estado);
    setError(null);
  };

  // Função para abrir o modal de cadastro de estado
  const abrirModalCadastroEstado = () => {
    setEstadoModalOpen(true);
    setEstadoSearchModalOpen(false);
  };

  // Função para lidar com o estado recém-criado
  const handleEstadoSaved = async (novoEstado) => {
    if (novoEstado && novoEstado.id > 0) {
      handleEstadoSelect(novoEstado);
      showSuccess('Estado criado e selecionado com sucesso!');
    } else {
      showError('Erro ao selecionar o estado recém-criado.');
    }
  };
  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            {isNew ? 'Nova Cidade' : 'Editar Cidade'}
          </h4>
          {/* Botão Voltar removido */}
        </div>
        
        {error && <Alert color="danger"><FontAwesomeIcon icon={faTimes} className="me-2" />{error}</Alert>}
        {success && <Alert color="success"><FontAwesomeIcon icon={faSave} className="me-2" />Cidade salva com sucesso!</Alert>}
          <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="nome">Cidade <span className="text-danger">*</span></Label>
            <Input 
              type="text"
              id="nome"
              name="nome"
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
              id="codigoIBGE"
              name="codigoIBGE"
              value={formData.codigoIBGE || ''}
              onChange={handleChange}
              placeholder="Ex: 3550308 (IBGE)"
            />
            <small className="text-muted">Opcional. Código IBGE ou outro identificador geográfico padrão</small>
          </FormGroup>
            <FormGroup>
            <Label for="estadoId">Estado <span className="text-danger">*</span></Label>
            <div className="d-flex align-items-center">
              <Input
                type="text"
                id="estadoExibicao"
                value={estadoSelecionado ? `${estadoSelecionado.nome} (${estadoSelecionado.uf}) - ${estadoSelecionado.paisNome}` : 'Nenhum estado selecionado'}
                disabled
                className="me-2"
                style={styles.campoSelecaoApenasLupa}
              />              <Input
                type="hidden"
                name="estadoId"
                id="estadoId"
                value={formData.estadoId || ''}
              />
              
              {/* Botão de lupa para abrir o modal de pesquisa */}
              <Button 
                className="search-btn-cadastro"
                onClick={() => setEstadoSearchModalOpen(true)}
                title="Buscar estado"
              >
                <FontAwesomeIcon icon={faSearch} className="search-icon-visible" />
              </Button>
              
              {/* Modal de pesquisa de estado */}
              <EstadoSearchModal 
                isOpen={estadoSearchModalOpen}
                toggle={() => setEstadoSearchModalOpen(!estadoSearchModalOpen)}
                onSelect={(estado) => {
                  handleEstadoSelect(estado);
                  setEstadoSearchModalOpen(false);
                }}
                renderButton={false}
              />
            </div>
          </FormGroup>

          {/* Switch de situação (Ativo/Inativo) */}
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
              onClick={() => navigate('/localizacao/cidades')}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancelar
            </Button>
          </div>
        </Form>
        
        <EstadoModalForm 
          isOpen={estadoModalOpen}
          toggle={() => setEstadoModalOpen(!estadoModalOpen)}
          onSaved={handleEstadoSaved}
        />
      </CardBody>
    </Card>
  );
};

export default CidadeForm;