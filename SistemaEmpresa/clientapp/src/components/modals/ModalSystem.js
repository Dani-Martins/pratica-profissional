import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';

// Modal de confirmação para ações como exclusão
export const ConfirmationModal = ({ 
  isOpen, 
  toggle, 
  onConfirm, 
  title = 'Confirmação', 
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'danger',
  isProcessing = false
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button color={confirmColor} onClick={onConfirm} disabled={isProcessing}>
          {isProcessing && <Spinner size="sm" className="me-1" />}
          {confirmText}
        </Button>
        <Button color="secondary" onClick={toggle}>
          {cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Modal para formulários
export const FormModal = ({ 
  isOpen, 
  toggle, 
  title, 
  onSubmit, 
  isProcessing, 
  children,
  size
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (typeof onSubmit === 'function') {
      try {
        onSubmit(e);
      } catch (error) {
        console.error("Erro ao executar onSubmit no modal:", error);
      }
    }
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle} size={size}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          <Button 
            type="submit" 
            color="primary" 
            disabled={isProcessing}
          >
            {isProcessing && <Spinner size="sm" className="me-1" />}
            Salvar
          </Button>
          <Button type="button" color="secondary" onClick={toggle}>
            Cancelar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};