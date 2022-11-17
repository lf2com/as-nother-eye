import classnames from 'classnames';
import React, {
  FunctionComponent, PropsWithChildren, useCallback, useMemo,
} from 'react';

import Clickable from '../../Clickable';

import styles from './styles.module.scss';

export interface ModalButtonProps {
  disabled?: boolean;
  highlight?: boolean;
  onClick: () => void;
}

const ModalButton: FunctionComponent<PropsWithChildren<ModalButtonProps>> = ({
  disabled = false,
  highlight = false,
  onClick,
  children,
}) => {
  const className = useMemo(() => (
    classnames(styles.button, {
      [styles.highlight]: highlight,
      [styles.disabled]: disabled,
    })
  ), [disabled, highlight]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <Clickable
      className={className}
      stopPropagation={disabled}
      onClick={handleClick}
    >
      {children}
    </Clickable>
  );
};

export default ModalButton;
