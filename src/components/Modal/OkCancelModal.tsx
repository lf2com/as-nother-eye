import React from 'react';

import ModalButton from './components/Button';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';
import Modal, { ModalBasicProps } from '.';

interface OkCancelModalProps extends ModalBasicProps {
  onOk: () => void;
  onCancel: () => void;
  disabled?: boolean;
  disabledOk?: boolean;
  disabledCancel?: boolean;
}

const OkCancelModal: FunctionComponentWithChildren<OkCancelModalProps> = ({
  onOk,
  onCancel,
  disabled,
  disabledOk,
  disabledCancel,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    buttons={[
      (
        <ModalButton
          key='cancel'
          disabled={disabled || disabledCancel}
          onClick={onCancel}
        >
          Cancel
        </ModalButton>
      ),
      (
        <ModalButton
          key='ok'
          highlight
          disabled={disabled || disabledOk}
          onClick={onOk}
        >
          OK
        </ModalButton>
      ),
    ]}
  >
    {children}
  </Modal>
);

export default OkCancelModal;
