import React from 'react';

import { FCWithChildren } from '@/types/ComponentProps';

import Modal, { ModalBasicProps, ModalButton } from '.';

interface YesNoModalProps extends ModalBasicProps {
  onYes: () => void;
  onNo: () => void;
}

const YesNoModal: FCWithChildren<YesNoModalProps> = ({
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
