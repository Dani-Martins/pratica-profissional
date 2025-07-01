import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Input, Table, Spinner, Badge } from 'reactstrap';
import CondicaoPagamentoService from '../../../api/services/condicaoPagamentoService';
import CondicaoPagamentoFormModal from './CondicaoPagamentoFormModal';
import SearchButton from '../../../components/buttons/SearchButton';

const CondicaoPagamentoSearchModal = ({ isOpen, toggle, onSelect, renderButton = true }) => {
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [filteredCondicoes, setFilteredCondicoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCondicoesPagamento();
    }
  }, [isOpen]);

  const fetchCondicoesPagamento = async () => {
    try {
      setLoading(true);
      const data = await CondicaoPagamentoService.getAll();
      setCondicoesPagamento(data);
      setFilteredCondicoes(data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCondicoes(condicoesPagamento);
      return;
    }    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = condicoesPagamento.filter(condicao => 
      (condicao.descricao && condicao.descricao.toLowerCase().includes(lowerSearchTerm)) ||
      (condicao.codigo && condicao.codigo.toLowerCase().includes(lowerSearchTerm)) ||
      (condicao.tipo && condicao.tipo.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredCondicoes(filtered);
  }, [searchTerm, condicoesPagamento]);

  const handleSelect = (condicao) => {
    onSelect(condicao);
    toggle();
  };

  const handleCondicaoAdded = (novaCondicao) => {
    setCondicoesPagamento(prev => [...prev, novaCondicao]);
    setFilteredCondicoes(prev => [...prev, novaCondicao]);
    setShowForm(false);
    
    // Auto-selecionar a condição recém-criada
    handleSelect(novaCondicao);
  };

  return (
    <>
      {renderButton && (
        <SearchButton 
          onClick={toggle} 
          title="Buscar condição de pagamento"
        />
      )}

      {/* Modal de consulta */}
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Consulta de Condições de Pagamento</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Input
              type="text"
              placeholder="Buscar por código, tipo ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="me-2"
            />
            
            <Button color="success" onClick={() => setShowForm(true)}>
              + Nova Condição
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner color="primary" />
              <p className="mt-2">Carregando condições de pagamento...</p>
            </div>
          ) : (          <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Juros</th>
                  <th>Multa</th>
                  <th>Desconto</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCondicoes.length > 0 ? (
                  filteredCondicoes.map(condicao => (
                    <tr key={condicao.id}>                      <td>{condicao.codigo}</td>
                      <td>{condicao.tipo}</td>
                      <td>{condicao.descricao}</td>
                      <td>{(parseFloat(condicao.percentualJuros || condicao.juros) || 0).toFixed(2)}%</td>
                      <td>{(parseFloat(condicao.percentualMulta || condicao.multa) || 0).toFixed(2)}%</td>
                      <td>{(parseFloat(condicao.percentualDesconto || condicao.desconto) || 0).toFixed(2)}%</td>
                      <td>
                        <Badge color={condicao.ativo ? "success" : "danger"}>
                          {condicao.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleSelect(condicao)}>
                          Selecionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Nenhuma condição de pagamento encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Modal de cadastro */}
      <CondicaoPagamentoFormModal 
        isOpen={showForm} 
        toggle={() => setShowForm(!showForm)} 
        onSuccess={handleCondicaoAdded} 
      />
    </>
  );
};

export default CondicaoPagamentoSearchModal;
