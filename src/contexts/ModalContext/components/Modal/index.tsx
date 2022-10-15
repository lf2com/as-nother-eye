import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, TransitionEventHandler,
  useCallback, useEffect, useMemo, useState,
} from 'react';

import ModalButton from '../ModalButton';

import styles from './styles.module.scss';

export interface ModalBasicProps {
  title?: React.ReactNode;
  highlight?: boolean;
  onShown?: () => void;
  onHidden?: () => void;
  hideOnClickOutside?: boolean;
}

export interface ModalProps extends ModalBasicProps {
  button?: ReturnType<typeof ModalButton>;
  buttons?: ReturnType<typeof ModalButton>[];
}

const Modal: FunctionComponent<PropsWithChildren<ModalProps>> = ({
  title,
  button,
  buttons = button ? [button] : [],
  highlight = false,
  onShown,
  onHidden,
  hideOnClickOutside = true,
  children,
}) => {
  const [show, setShow] = useState(false);

  const className = useMemo(() => (
    classnames(styles.modal, {
      [styles.highlight]: highlight,
      [styles.show]: show,
    })
  ), [highlight, show]);

  const onClickOutside = useCallback<MouseEventHandler>(() => {
    if (hideOnClickOutside) {
      setShow(false);
    }
  }, [hideOnClickOutside]);

  const onClickContainer = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  const onClickButton = useCallback(() => {
    setShow(false);
  }, []);

  const onTransitionEnd = useCallback<TransitionEventHandler>(() => {
    if (show) {
      onShown?.();
    } else {
      onHidden?.();
    }
  }, [onHidden, onShown, show]);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div
      className={className}
      onClick={onClickOutside}
    >
      <div
        className={styles.box}
        onClick={onClickContainer}
        onTransitionEnd={onTransitionEnd}
      >
        <div>
          {title}
        </div>
        <div className={styles.body}>
          {children}
        </div>
        <div
          className={styles.foot}
          onClick={onClickButton}
        >
          {buttons}
        </div>
      </div>
    </div>
  );
};

export default Modal;
