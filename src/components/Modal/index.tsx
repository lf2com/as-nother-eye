import classNames from 'classnames';
import type {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  TransitionEventHandler,
} from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import twClassNames from '@/utils/twClassNames';
import wait from '@/utils/wait';

import ModalButton from './components/Button';
import ModalButtonContextProvider from './contexts/ModalButtonContext';

export interface ModalBasicProps {
  show?: boolean;
  title?: ReactNode;
  highlight?: boolean;
  onShown?: () => void;
  onHidden?: () => void;
  onClickOutside?: () => boolean | void;
  hideOnClickOutside?: boolean;
}

export interface ModalProps extends ModalBasicProps {
  button?: ReturnType<typeof ModalButton>;
  buttons?: ReturnType<typeof ModalButton>[];
  buttonOnlyOnce?: boolean;
  className?: string;
  bodyClassName?: string;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  show: propShow,
  className,
  title,
  button,
  buttons = button ? [button] : [],
  highlight = false,
  buttonOnlyOnce = true,
  onShown,
  onHidden,
  onClickOutside,
  hideOnClickOutside = true,
  bodyClassName,
  children,
}) => {
  const [show, setShow] = useState(false);
  const [disabledAll, setDisabledAll] = useState(false);

  const handleClickOutside = useCallback<MouseEventHandler>(() => {
    if (onClickOutside?.() !== false && hideOnClickOutside) {
      setShow(false);
    }
  }, [hideOnClickOutside, onClickOutside]);

  const onClickContainer = useCallback<MouseEventHandler>(event => {
    event.stopPropagation();
  }, []);

  const onClickButton = useCallback(() => {
    if (buttonOnlyOnce) {
      setDisabledAll(true);
    }

    if (propShow === undefined) {
      setShow(false);
    }
  }, [buttonOnlyOnce, propShow, setDisabledAll]);

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

      if (nextShow) {
        setDisabledAll(false);
      }
    });
  }, [propShow]);

  return (
    <ModalButtonContextProvider disabledAll={disabledAll}>
      <div
        className={classNames(
          'fixed top-0 right-0 bottom-0 left-0 bg-black/0 text-black text-[1rem] z-[1000] flex justify-center items-center pointer-events-none',
          {
            'bg-black/50 brightness-75': highlight,
            'opacity-100 pointer-events-auto': show,
          },
          className
        )}
        onClick={handleClickOutside}
      >
        <div
          className={classNames(
            'relative translate-y-[0.35em] -top-[2em] m-[1em] max-h-[80%] box-border shadow-[0_0_0.5em_rgba(0,0,0,0.5)]',
            'rounded-[0.25em] bg-white flex flex-col overflow-hidden opacity-0',
            '[&>*]:py-0 [&>*]:px-[1em]',
            { 'translate-y-0 top-0 opacity-100': show }
          )}
          onClick={onClickContainer}
          onTransitionEnd={onTransitionEnd}
          style={{
            transition: [
              'top 0.25s ease-in-out',
              'opacity 0.25s ease-in-out',
              'transform 0.1s ease-in-out 0.25s',
            ].join(','),
          }}
        >
          <div
            className={classNames(
              'py-[0.5em] px-[1em] bg-[#36f] text-white font-bold text-center',
              'empty:p-0'
            )}
          >
            {title}
          </div>
          <div
            className={twClassNames(
              'p-[1em] text-center overflow-auto grow shrink',
              bodyClassName
            )}
          >
            {children}
          </div>
          <div
            className={classNames(
              'my-[1em] mx-0 flex justify-evenly empty:m-0'
            )}
            onClick={onClickButton}
          >
            {buttons}
          </div>
        </div>
      </div>
    </ModalButtonContextProvider>
  );
};

export { ModalButton };

export default Modal;
