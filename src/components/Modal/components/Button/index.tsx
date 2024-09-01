import classNames from 'classnames';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';

import Clickable from '@/components/Clickable';

import { useModalButtonContext } from '../../contexts/ModalButtonContext';

export interface ModalButtonProps {
  disabled?: boolean;
  highlight?: boolean;
  onClick: () => void;
}

const ModalButton: FC<PropsWithChildren<ModalButtonProps>> = ({
  disabled = false,
  highlight = false,
  onClick,
  children,
}) => {
  const { disabledAll } = useModalButtonContext();

  return (
    <Clickable
      disabled={disabledAll || disabled}
      className={classNames(
        'my-0 mx-[1em] py-[0.35em] px-[1em] min-w-[3em] max-w-full rounded-[0.25em] border-[0.05em] border-[#36f]',
        'bg-white text-[#36f] text-[0.95em] text-center block select-none',
        {
          'bg-[#36f] text-white': highlight,
          'border-[#ccc] text-[#ccc]': disabled,
          'bg-[#ccc] text-white': disabled && highlight,
        }
      )}
      stopPropagation={disabled}
      onClick={onClick}
    >
      {children}
    </Clickable>
  );
};

export default ModalButton;
