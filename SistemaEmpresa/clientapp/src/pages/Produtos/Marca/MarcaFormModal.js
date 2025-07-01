import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import MarcaForm from './MarcaForm';

const MarcaFormModal = ({ isOpen, toggle, onSaved }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Nova Marca</ModalHeader>
      <ModalBody>
        <MarcaForm onSaved={onSaved} onCancel={toggle} isModal />
      </ModalBody>
    </Modal>
  );
};

export default MarcaFormModal;
