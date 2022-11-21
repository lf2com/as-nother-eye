import React, { FunctionComponent, PropsWithChildren } from 'react';

import ModalButton from './components/Button';

import Modal, { ModalBasicProps } from '.';

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
