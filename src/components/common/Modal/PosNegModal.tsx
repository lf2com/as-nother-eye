import type { FC, ReactNode } from 'react';

import type { ModalBaseProps } from './Modal';
import Modal from './Modal';
import ModalButton from './ModalButton';

interface PosNegModalProps extends ModalBaseProps {
  disabledPositive?: boolean;
  disabledNegative?: boolean;
  btnPositiveContent?: ReactNode;
  btnNegativeContent?: ReactNode;
  onClickPositive: () => void;
  onClickNegative: () => void;
}

const PosNegModal: FC<PosNegModalProps> = ({
  disabledPositive = false,
  disabledNegative = false,
  btnPositiveContent = 'Yes',
  btnNegativeContent = 'No',
  onClickPositive,
  onClickNegative,
  ...restProps
}) => (
  <Modal
    {...restProps}
    footerClassName="grid-cols-2"
    footer={
      <>
        <ModalButton disabled={disabledNegative} onClick={onClickNegative}>
          {btnNegativeContent}
        </ModalButton>
        <ModalButton disabled={disabledPositive} onClick={onClickPositive}>
          {btnPositiveContent}
        </ModalButton>
      </>
    }
  />
);

export default PosNegModal;
