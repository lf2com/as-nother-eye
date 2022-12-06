import React from 'react';

import ModalButton from './components/Button';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';
import Modal, { ModalBasicProps } from '.';

interface OkCancelModalProps extends ModalBasicProps {
  onOk: () => void;
  onCancel: () => void;
}

const OkCancelModal: FunctionComponentWithChildren<OkCancelModalProps> = ({
  onOk,
  onCancel,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    buttons={[
      (
        <ModalButton key='cancel' onClick={onCancel}>
          Cancel
        </ModalButton>
      ),
      (
        <ModalButton key='ok' highlight onClick={onOk}>
          OK
        </ModalButton>
      ),
    ]}
  >
    {children}
  </Modal>
);

export default OkCancelModal;
