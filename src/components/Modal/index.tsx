import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, TransitionEventHandler,
  useCallback, useEffect, useMemo, useState,
} from 'react';

import wait from '../../utils/wait';

import ModalButton from './Button';

import styles from './styles.module.scss';

export interface ModalBasicProps {
  show?: boolean;
  className?: string;
  title?: React.ReactNode;
  highlight?: boolean;
  onShown?: () => void;
  onHidden?: () => void;
  onClickOutside?: () => boolean | void;
  hideOnClickOutside?: boolean;
}

export interface ModalProps extends ModalBasicProps {
  button?: ReturnType<typeof ModalButton>;
  buttons?: ReturnType<typeof ModalButton>[];
}

const Modal: FunctionComponent<PropsWithChildren<ModalProps>> = ({
  show: propShow,
  className,
  title,
  button,
  buttons = button ? [button] : [],
  highlight = false,
  onShown,
  onHidden,
  onClickOutside,
  hideOnClickOutside = true,
  children,
}) => {
  const [show, setShow] = useState(false);

  const modalClassName = useMemo(() => (
    classnames(styles.modal, {
      [styles.highlight]: highlight,
      [styles.show]: show,
    }, className)
  ), [highlight, show, className]);

  const handleClickOutside = useCallback<MouseEventHandler>(() => {
    if (onClickOutside?.() !== false && hideOnClickOutside) {
      setShow(false);
    }
  }, [hideOnClickOutside, onClickOutside]);

  const onClickContainer = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  const onClickButton = useCallback(() => {
    if (propShow === undefined) {
      setShow(false);
    }
  }, [propShow]);

  const onTransitionEnd = useCallback<TransitionEventHandler>(() => {
    if (show) {
      onShown?.();
    } else {
      onHidden?.();
    }
  }, [onHidden, onShown, show]);

  useEffect(() => {
    const nextShow = propShow ?? true;

    wait(nextShow ? 100 : 0).then(() => {
      setShow(nextShow);
    });
  }, [propShow]);

  return (
    <div
      className={modalClassName}
      onClick={handleClickOutside}
    >
      <div
        className={classnames(styles.box, 'modal-box')}
        onClick={onClickContainer}
        onTransitionEnd={onTransitionEnd}
      >
        <div className={classnames(styles.head, 'modal-head')}>
          {title}
        </div>
        <div className={classnames(styles.body, 'modal-body')}>
          {children}
        </div>
        <div
          className={classnames(styles.foot, 'modal-foot')}
          onClick={onClickButton}
        >
          {buttons}
        </div>
      </div>
    </div>
  );
};

export default Modal;
