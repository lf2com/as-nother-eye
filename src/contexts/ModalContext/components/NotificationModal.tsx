import React, { FunctionComponent, PropsWithChildren } from 'react';

import Modal, { ModalBasicProps } from './Modal';
import ModalButton from './ModalButton';

interface NotificationModalProps extends ModalBasicProps {
  onOk: () => void;
}

const NotificationModal: FunctionComponent<PropsWithChildren<NotificationModalProps>> = ({
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
