import type {
  ChangeEventHandler,
  FC,
  KeyboardEventHandler,
  PropsWithChildren,
} from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import twClassNames from '@/utils/twClassNames';

import OkCancelModal from './OkCancelModal';

import type { ModalBasicProps } from '.';

export interface AskInputModalProps {
  show: boolean;
  onConfirm: (input: string) => void;
  onCancel: () => void;
  onChange?: (input: string) => void;
  onKeyDown?: (input: {
    key: string;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  }) => void;
  onClickOutside?: ModalBasicProps['onClickOutside'];
}

const AskInputModal: FC<PropsWithChildren<AskInputModalProps>> = ({
  show,
  onConfirm,
  onCancel,
  onChange,
  onKeyDown,
  onClickOutside,
  children,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>();
  const refInput = useRef<HTMLInputElement>(null);

  const onOk = useCallback(() => {
    onConfirm(inputValue);
  }, [inputValue, onConfirm]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    event => {
      const {
        target: { value },
      } = event;

      setInputValue(value);
      onChange?.(value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    event => {
      const { key } = event;

      if (onKeyDown) {
        const { altKey, ctrlKey, metaKey, shiftKey } = event;

        onKeyDown?.({
          key,
          altKey,
          ctrlKey,
          metaKey,
          shiftKey,
        });
      }
      if (key === 'Enter') {
        setIsConfirmed(true);
        onOk();
      }
    },
    [onKeyDown, onOk]
  );

  useEffect(() => {
    if (show) {
      setIsConfirmed(false);
      setTimeout(() => {
        refInput.current?.select();
      });
    }
  }, [show]);

  return (
    <OkCancelModal
      show={show}
      onOk={onOk}
      onCancel={onCancel}
      onClickOutside={onClickOutside}
      disabled={isConfirmed}
    >
      <p>{children}</p>
      <input
        ref={refInput}
        className={twClassNames(
          'my-0 mx-[0.25em] py-[0.25em] px-[0.35em] outline-none rounded-[0.5em] border border-[#999] text-[#999] text-[1em] font-[monospace]',
          'hover:border-[#333] focus:border-[#333] focus:text-[#333]'
        )}
        disabled={isConfirmed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </OkCancelModal>
  );
};

export default AskInputModal;
