import classNames from 'classnames';
import React from 'react';

import Clickable from '@/components/Clickable';
import type { FCWithChildren } from '@/types/ComponentProps';

import { useModalButtonContext } from '../../contexts/ModalButtonContext';
import styles from './styles.module.scss';

export interface ModalButtonProps {
  disabled?: boolean;
  highlight?: boolean;
  onClick: () => void;
}

const ModalButton: FCWithChildren<ModalButtonProps> = ({
  disabled = false,
  highlight = false,
  onClick,
  children,
}) => {
  const { disabledAll } = useModalButtonContext();

  return (
    <Clickable
      disabled={disabledAll || disabled}
      className={classNames(styles.button, {
        [styles.highlight]: highlight,
      })}
      stopPropagation={disabled}
      onClick={onClick}
    >
      {children}
    </Clickable>
  );
};

export default ModalButton;
