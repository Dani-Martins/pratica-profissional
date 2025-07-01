import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import CategoriaForm from './CategoriaForm';

const CategoriaFormModal = ({ isOpen, toggle, onSaved }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Nova Categoria</ModalHeader>
      <ModalBody>
        <CategoriaForm onSaved={onSaved} onCancel={toggle} isModal />
      </ModalBody>
    </Modal>
  );
};

export default CategoriaFormModal;
