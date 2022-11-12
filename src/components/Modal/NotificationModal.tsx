import React, { FunctionComponent, PropsWithChildren } from 'react';

import ModalButton from './Button';

import Modal, { ModalBasicProps } from '.';

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
