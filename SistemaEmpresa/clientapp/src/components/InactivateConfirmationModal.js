import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import '../pages/Localizacao/Cidade/cidade-search-icon.css';

const InactivateConfirmationModal = ({ isOpen, toggle, onInactivate, title, message, itemName, itemType }) => {
  const displayMessage = message || (itemName && itemType ? 
    `Tem certeza que deseja inativar ${itemType === 'o' ? 'o' : 'a'} ${itemType} "${itemName}"?` : 
    'Tem certeza que deseja inativar este item?'
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title || 'Confirmar Exclusão'}</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center mb-3">
          <div className="modal-warning-icon">
            <span>!</span>
          </div>
          <span>{displayMessage}</span>
        </div>
        <p className="text-muted">Esta ação não poderá ser desfeita.</p>
      </ModalBody>
      <ModalFooter>
        <div className="w-100">
          <Button color="danger" className="me-2" onClick={onInactivate}>
            Excluir
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancelar
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default InactivateConfirmationModal;
