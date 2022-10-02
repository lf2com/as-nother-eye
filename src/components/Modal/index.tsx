import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, useCallback, useMemo,
} from 'react';

import ModalButton from './Button';
import styles from './styles.module.scss';

export interface ModalBasicProps {
  show: boolean;
  title?: React.ReactNode;
  highlight?: boolean;
  onClickOutside?: () => void;
}

export interface ModalProps extends ModalBasicProps {
  button?: ReturnType<typeof ModalButton>;
  buttons?: ReturnType<typeof ModalButton>[];
  highlight?: boolean;
}

const Modal: FunctionComponent<PropsWithChildren<ModalProps>> = ({
  show,
  title,
  button,
  buttons = button ? [button] : [],
  highlight = false,
  onClickOutside,
  children,
}) => {
  const className = useMemo(() => (
    classnames(styles.modal, {
      [styles.highlight]: highlight,
      [styles.show]: show,
    })
  ), [highlight, show]);
  const onClickContainer = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  return (
    <div className={className} onClick={onClickOutside}>
      <div className={styles.box} onClick={onClickContainer}>
        <div>
          {title}
        </div>
        <div className={styles.body}>
          {children}
        </div>
        <div className={styles.foot}>
          {buttons}
        </div>
      </div>
    </div>
  );
};

export default Modal;
