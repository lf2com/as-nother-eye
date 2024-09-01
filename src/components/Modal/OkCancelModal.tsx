import React from 'react';

import type { FCWithChildren } from '@/types/ComponentProps';

import type { ModalBasicProps } from '.';
import Modal, { ModalButton } from '.';

interface OkCancelModalProps extends ModalBasicProps {
  onOk: () => void;
  onCancel: () => void;
  disabled?: boolean;
  disabledOk?: boolean;
  disabledCancel?: boolean;
}

const OkCancelModal: FCWithChildren<OkCancelModalProps> = ({
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
      <ModalButton
        key="cancel"
        disabled={disabled || disabledCancel}
        onClick={onCancel}
      >
        Cancel
      </ModalButton>,
      <ModalButton
        key="ok"
        highlight
        disabled={disabled || disabledOk}
        onClick={onOk}
      >
        OK
      </ModalButton>,
    ]}
  >
    {children}
  </Modal>
);

export default OkCancelModal;
