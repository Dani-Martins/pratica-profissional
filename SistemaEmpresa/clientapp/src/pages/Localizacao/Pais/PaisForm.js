import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, InputGroup, InputGroupText, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import PaisService from '../../../api/services/paisService';
import { handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

const PaisForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;    const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    codigo: '',
    situacao: 1,
    userCriacao: 'SISTEMA',
    userAlteracao: 'SISTEMA'
  });
    const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isNew && id) {      const fetchPais = async () => {
        try {
          setLoading(true);
          console.log("Buscando país com ID:", id);
          
          const paisData = await PaisService.getById(id);
          console.log("Dados recebidos do país:", paisData);
          
          // Se for país inativo, colocar uma mensagem
          if (Number(paisData.situacao) === 0) {
            setSubmitError("Este país está marcado como inativo. Marque a opção 'Ativo' para reativá-lo.");
          }setFormData({
            nome: paisData.nome || '',
            sigla: paisData.sigla || '',
            codigo: paisData.codigo || '',
            situacao: paisData.situacao ?? 1,
            userCriacao: paisData.userCriacao || 'SISTEMA',
            userAlteracao: 'SISTEMA' // Sempre o mesmo usuário ao editar
          });
        } catch (error) {          console.error("Erro ao buscar país:", error);
          setSubmitError("Não foi possível carregar os dados do país");
        } finally {
          setLoading(false);
        }
      };
      
      fetchPais();
    }
  }, [id, isNew]);
  const [siglaErro, setSiglaErro] = useState('');
  
  // Verificar se a sigla já existe no sistema
  const verificarSiglaExistente = async (sigla) => {
    try {
      if (!sigla || sigla.length !== 2) {
        // Não verificar se a sigla for vazia ou não tiver exatamente 2 letras
        setSiglaErro('');
        return false;
      }
      
      // Se estiver editando um país, não considerar a sigla do próprio país
      if (!isNew && id) {
        const paisAtual = await PaisService.getById(id);
        if (paisAtual.sigla === sigla) {
          setSiglaErro('');
          return false;
        }
      }
      
      // Buscar todos os países para verificar se a sigla já existe
      const paises = await PaisService.getAll();
      const siglaExistente = paises.some(pais => pais.sigla === sigla);
      
      if (siglaExistente) {
        setSiglaErro(`A sigla "${sigla}" já está sendo utilizada por outro país.`);
        return true;
      } else {
        setSiglaErro('');
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar sigla:', error);
      return false;
    }
  };
  
  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    // Aplicar transformação para maiúsculo em campos de texto
    const transformedValue = handleUpperCaseChange(name, value);
    
    // Se o campo for a sigla, vamos validar
    if (name === 'sigla') {
      // Converter para maiúsculo e limitar a 2 caracteres
      const siglaFormatada = transformedValue.slice(0, 2);
      
      setFormData(prevData => ({
        ...prevData,
        [name]: siglaFormatada
      }));
      
      // Verificar se a sigla já existe, mas apenas se tiver 2 caracteres
      if (siglaFormatada.length === 2) {
        await verificarSiglaExistente(siglaFormatada);
      } else if (siglaFormatada.length < 2) {
        setSiglaErro('A sigla deve ter exatamente 2 letras.');
      } else {
        setSiglaErro('');
      }
    } else {
      // Para outros campos, usar o valor transformado
      setFormData(prevData => ({
        ...prevData,
        [name]: transformedValue
      }));
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validações básicas
    if (!formData.nome || formData.nome.trim() === '') {
      setSubmitError('O nome do país é obrigatório.');
      setLoading(false);
      return;
    }
    
    // Validar formato da sigla
    if (!formData.sigla || formData.sigla.trim() === '') {
      setSubmitError('A sigla do país é obrigatória.');
      setLoading(false);
      return;
    }
    
    if (formData.sigla.length !== 2) {
      setSubmitError('A sigla deve ter exatamente 2 letras.');
      setLoading(false);
      return;
    }
    
    // Verificar se a sigla já existe
    const siglaExiste = await verificarSiglaExistente(formData.sigla);
    if (siglaExiste) {
      setSubmitError(siglaErro);
      setLoading(false);
      return;
    }
    
    try {
      if (isNew) {
        await PaisService.create(formData);
      } else {
        await PaisService.update(id, formData);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/localizacao/paises'); // Ajuste para a rota correta de listagem
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar país:', error);
      setSubmitError(error.response?.data?.mensagem || 'Ocorreu um erro ao salvar o país. Por favor tente novamente.');
    } finally {
      setLoading(false);
    }
  };
    const handleReativar = async () => {
    try {
      setLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      // Atualizar o formulário para status ativo
      const dadosReativacao = {
        ...formData,
        situacao: 1
      };
      
      // Chamar método update padrão
      await PaisService.update(id, dadosReativacao);
        setSubmitSuccess(true);
      setFormData(prev => ({...prev, situacao: 1}));
      
      // Forçar atualização da tela principal
      window.dispatchEvent(new CustomEvent('dataChange'));
      
      setTimeout(() => {
        navigate('/localizacao/paises');
      }, 1500);
    } catch (error) {
      console.error('Erro ao reativar país:', error);
      setSubmitError(`Erro ao reativar país: ${error.message || 'Ocorreu um erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            {isNew ? 'Novo País' : 'Editar País'}
          </h4>
          {/* Botão Voltar removido */}
        </div>

        {submitError && (
          <Alert color="danger">
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            {submitError}
          </Alert>
        )}

        {submitSuccess && (
          <Alert color="success">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            País salvo com sucesso!
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>          <FormGroup>
            <Label for="nome">País <span className="text-danger">*</span></Label>
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
            <Label for="sigla">Sigla <span className="text-danger">*</span></Label>
            <Input 
              type="text"
              id="sigla"
              name="sigla"
              value={formData.sigla}
              onChange={handleChange}
              maxLength={2}
              placeholder="Digite a sigla com 2 letras (Ex: BR, US, JP)"
              invalid={!!siglaErro}
              required
            />
            {siglaErro && (
              <div className="text-danger mt-1">
                {siglaErro}
              </div>
            )}
            <small className="form-text text-muted">
              A sigla deve conter exatamente 2 letras e ser única no sistema.
            </small>
          </FormGroup>          <FormGroup>
            <Label for="codigo">Código Telefônico <span className="text-danger">*</span></Label>
            <InputGroup>
              <InputGroupText>+</InputGroupText>
              <Input
                type="text"
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Digite o código telefônico (sem o +)"
                required
              />
            </InputGroup>
            <small className="form-text text-muted">
              Exemplo: 55 para Brasil, 1 para Estados Unidos
            </small>          </FormGroup>
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
          
          {!isNew && Number(formData.situacao) === 0 && (
            <FormGroup className="mt-3">
              <Button 
                color="success" 
                type="button"
                onClick={handleReativar}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Reativar País
              </Button>
              <small className="d-block mt-1 text-muted">
                Clique aqui para reativar o país diretamente
              </small>
            </FormGroup>
          )}
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
              onClick={() => navigate('/localizacao/paises')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default PaisForm;

// Ou outro arquivo similar com um formulário completo