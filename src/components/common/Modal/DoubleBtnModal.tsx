import type { FC, ReactNode } from 'react';

import type { ModalBaseProps } from './Modal';
import Modal from './Modal';
import ModalButton from './ModalButton';

interface DoubleBtnModalProps extends ModalBaseProps {
  onClickB?: () => void;
  onClickA?: () => void;
  btnAContent?: ReactNode;
  btnBContent?: ReactNode;
  disabledA?: boolean;
  disabledB?: boolean;
}

const DoubleBtnModal: FC<DoubleBtnModalProps> = ({
  onClickA,
  onClickB,
  btnAContent = 'Cancel',
  btnBContent = 'OK',
  disabledA = !onClickA,
  disabledB = !onClickB,
  ...restProps
}) => (
  <Modal
    {...restProps}
    footerClassName="grid-cols-2"
    footer={
      <>
        <ModalButton disabled={disabledA} onClick={onClickA}>
          {btnAContent}
        </ModalButton>
        <ModalButton disabled={disabledB} onClick={onClickB}>
          {btnBContent}
        </ModalButton>
      </>
    }
  />
);

export default DoubleBtnModal;
