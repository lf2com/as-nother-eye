import classnames from 'classnames';
import React, { useMemo } from 'react';

import { useModalButtonContext } from '../../contexts/ModalButtonContext';

import Clickable from '@/components/Clickable';

import { FCWithChildren } from '@/types/ComponentProps';

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
  const className = useMemo(() => classnames(styles.button, {
    [styles.highlight]: highlight,
  }), [highlight]);

  return (
    <Clickable
      disabled={disabledAll || disabled}
      className={className}
      stopPropagation={disabled}
      onClick={onClick}
    >
      {children}
    </Clickable>
  );
};

export default ModalButton;
