import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { handleUpperCaseChange } from '../../../utils/uppercaseTransformer';

const CategoriaForm = ({ onSaved, onCancel, isModal }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`/api/categoria/${id}`)
        .then(res => {
          setNome(res.data.categoriaNome || res.data.nome || '');
          setAtivo(!!res.data.situacao);
        })
        .catch(() => setError('Erro ao carregar categoria.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!nome.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }
    setLoading(true);
    const categoriaPayload = {
      nome: nome,
      situacao: !!ativo
    };
    try {
      if (isEdit) {
        await axios.put(`/api/categoria/${id}`, categoriaPayload);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        const res = await axios.post('/api/categoria', categoriaPayload);
        setSuccess('Categoria criada com sucesso!');
        setNome('');
        setAtivo(true);
        if (onSaved) {
          onSaved(res.data);
          return;
        }
      }
      setTimeout(() => navigate('/produtos/categoria'), 1200);
    } catch (err) {
      setError('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h4>
        </div>

        {error && (
          <Alert color="danger">
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="success">
            <FontAwesomeIcon icon={faSave} className="me-2" />{success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="categoria">Categoria <span className="text-danger">*</span></Label>
            <Input
              type="text"
              id="categoria"
              value={nome || ''}
              onChange={e => setNome(handleUpperCaseChange('nome', e.target.value))}
              maxLength={50}
              required
              autoFocus
              placeholder="EX: ALIMENTOS, BEBIDAS, ETC."
            />
          </FormGroup>

          <FormGroup check className="mb-4 mt-2">
            <div className="form-check form-switch">
              <Input
                type="checkbox"
                className="form-check-input"
                id="ativo"
                role="switch"
                name="ativo"
                checked={ativo}
                onChange={e => setAtivo(e.target.checked)}
              />
              <Label className="form-check-label" for="ativo" style={{ fontWeight: 700 }}>
                Ativo <span style={{ fontWeight: 400 }}>
                  {ativo ? (
                    <span className="text-success">(Registro Ativo)</span>
                  ) : (
                    <span className="text-danger">(Registro Inativo)</span>
                  )}
                </span>
              </Label>
            </div>
          </FormGroup>
          <div className="d-flex justify-content-end mt-4">
            <Button color="primary" type="submit" className="me-2" disabled={loading}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button color="secondary" onClick={() => navigate('/produtos/categoria')} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CategoriaForm;
