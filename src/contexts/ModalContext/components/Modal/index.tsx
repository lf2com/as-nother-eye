import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, TransitionEventHandler,
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { wait } from '../../../../utils/stdlib';

import ModalButton from '../ModalButton';

import styles from './styles.module.scss';

export interface ModalBasicProps {
  show?: boolean;
  className?: string;
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
  show: propShow = true,
  className,
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

  const modalClassName = useMemo(() => (
    classnames(styles.modal, {
      [styles.highlight]: highlight,
      [styles.show]: show,
    }, className)
  ), [highlight, show, className]);

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
    wait(propShow ? 100 : 0).then(() => {
      setShow(propShow);
    });
  }, [propShow]);

  return (
    <div
      className={modalClassName}
      onClick={onClickOutside}
    >
      <div
        className={classnames(styles.box, 'modal-box')}
        onClick={onClickContainer}
        onTransitionEnd={onTransitionEnd}
      >
        <div>
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
