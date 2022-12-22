import React from 'react';

import { FunctionComponentWithChildren } from '@/types/ComponentProps';

import Modal, { ModalBasicProps, ModalButton } from '.';

interface NotificationModalProps extends ModalBasicProps {
  onOk: () => void;
}

const NotificationModal: FunctionComponentWithChildren<NotificationModalProps> = ({
  onOk,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    button={(
      <ModalButton key='ok' highlight onClick={onOk}>
        OK
      </ModalButton>
    )}
  >
    {children}
  </Modal>
);

export default NotificationModal;
