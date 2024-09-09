import type { FC, ReactNode } from 'react';

import type { ModalBaseProps } from './Modal';
import Modal from './Modal';
import ModalButton from './ModalButton';

interface SingleBtnModalProps extends ModalBaseProps {
  disabled?: boolean;
  btnContent?: ReactNode;
  onClick: () => void;
}

const SingleBtnModal: FC<SingleBtnModalProps> = ({
  disabled = false,
  btnContent = 'OK',
  onClick,
  ...restProps
}) => (
  <Modal
    {...restProps}
    footerClassName="grid-cols-1"
    footer={
      <ModalButton disabled={disabled} onClick={onClick}>
        {btnContent}
      </ModalButton>
    }
  />
);

export default SingleBtnModal;
