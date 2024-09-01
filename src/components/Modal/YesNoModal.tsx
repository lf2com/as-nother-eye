import type { FC, PropsWithChildren } from 'react';
import React from 'react';

import type { ModalBasicProps } from '.';
import Modal, { ModalButton } from '.';

interface YesNoModalProps extends ModalBasicProps {
  onYes: () => void;
  onNo: () => void;
}

const YesNoModal: FC<PropsWithChildren<YesNoModalProps>> = ({
  onYes,
  onNo,
  children,
  ...restProps
}) => (
  <Modal
    {...restProps}
    buttons={[
      <ModalButton key="no" onClick={onNo}>
        No
      </ModalButton>,
      <ModalButton key="yes" highlight onClick={onYes}>
        Yes
      </ModalButton>,
    ]}
  >
    {children}
  </Modal>
);

export default YesNoModal;
