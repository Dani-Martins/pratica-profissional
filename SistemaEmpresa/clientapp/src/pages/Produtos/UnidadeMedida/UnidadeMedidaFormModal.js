import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import UnidadeMedidaForm from './UnidadeMedidaForm';

const UnidadeMedidaFormModal = ({ isOpen, toggle, onSaved }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Nova Unidade de Medida</ModalHeader>
      <ModalBody>
        <UnidadeMedidaForm onSaved={onSaved} onCancel={toggle} isModal />
      </ModalBody>
    </Modal>
  );
};

export default UnidadeMedidaFormModal;
