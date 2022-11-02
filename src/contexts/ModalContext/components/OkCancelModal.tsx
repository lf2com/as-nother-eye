import React, { FunctionComponent, PropsWithChildren } from 'react';

import Modal, { ModalBasicProps } from './Modal';
import ModalButton from './ModalButton';

interface OkCancelModalProps extends ModalBasicProps {
  onOk: () => void;
  onCancel: () => void;
}

const OkCancelModal: FunctionComponent<PropsWithChildren<OkCancelModalProps>> = ({
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
