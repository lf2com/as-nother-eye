import React from 'react';

import type { FCWithChildren } from '@/types/ComponentProps';

import type { ModalBasicProps } from '.';
import Modal, { ModalButton } from '.';

interface NotificationModalProps extends ModalBasicProps {
  onOk: () => void;
}

const NotificationModal: FCWithChildren<NotificationModalProps> = ({
  onOk,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    button={
      <ModalButton key="ok" highlight onClick={onOk}>
        OK
      </ModalButton>
    }
  >
    {children}
  </Modal>
);

export default NotificationModal;
