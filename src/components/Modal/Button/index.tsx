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
    onClick();
  }, [onClick]);

  return (
    <Clickable
      stopPropagation={disabled}
      onClick={handleClick}
    >
      <div className={className}>
        {children}
      </div>
    </Clickable>
  );
};

export default ModalButton;
