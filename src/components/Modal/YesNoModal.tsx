import React from 'react';

import ModalButton from './components/Button';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';
import Modal, { ModalBasicProps } from '.';

interface YesNoModalProps extends ModalBasicProps {
  onYes: () => void;
  onNo: () => void;
}

const YesNoModal: FunctionComponentWithChildren<YesNoModalProps> = ({
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
