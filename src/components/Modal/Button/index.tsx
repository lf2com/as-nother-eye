import classnames from 'classnames';
import React, { FunctionComponent, PropsWithChildren, useMemo } from 'react';

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

  return (
    <Clickable onClick={onClick}>
      <div className={className}>
        {children}
      </div>
    </Clickable>
  );
};

export default ModalButton;
