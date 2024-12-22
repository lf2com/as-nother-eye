import type { FC, ReactNode } from 'react';

import type { ModalBaseProps } from './Modal';
import Modal from './Modal';
import ModalButton from './ModalButton';

interface SingleBtnModalProps extends ModalBaseProps {
  onClick?: () => void;
  btnContent?: ReactNode;
  disabled?: boolean;
}

const SingleBtnModal: FC<SingleBtnModalProps> = ({
  onClick,
  btnContent = 'OK',
  disabled = !onClick,
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
