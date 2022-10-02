import React, { FunctionComponent, PropsWithChildren } from 'react';

import Modal, { ModalBasicProps } from '.';
import ModalButton from './Button';

interface ConfirmModalProps extends ModalBasicProps {
  onYes: () => void;
  onNo: () => void;
}

const ConfirmModal: FunctionComponent<PropsWithChildren<ConfirmModalProps>> = ({
  onYes,
  onNo,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    buttons={[
      (
        <ModalButton key='no' onClick={onNo}>
          No
        </ModalButton>
      ),
      (
        <ModalButton key='yes' highlight onClick={onYes}>
          Yes
        </ModalButton>
      ),
    ]}
  >
    {children}
  </Modal>
);

export default ConfirmModal;
