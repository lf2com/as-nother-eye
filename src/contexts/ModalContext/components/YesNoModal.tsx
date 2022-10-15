import React, { FunctionComponent, PropsWithChildren } from 'react';

import Modal, { ModalBasicProps } from './Modal';
import ModalButton from './ModalButton';

interface YesNoModalProps extends ModalBasicProps {
  onYes: () => void;
  onNo: () => void;
}

const YesNoModal: FunctionComponent<PropsWithChildren<YesNoModalProps>> = ({
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

export default YesNoModal;
