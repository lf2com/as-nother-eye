import React, {
  ChangeEventHandler, KeyboardEventHandler, useCallback, useEffect, useRef, useState,
} from 'react';

import { FCWithChildren } from '@/types/ComponentProps';

import { ModalBasicProps } from '.';
import OkCancelModal from './OkCancelModal';

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

const AskInputModal: FCWithChildren<AskInputModalProps> = ({
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

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const {
      target: {
        value,
      },
    } = event;

    setInputValue(value);
    onChange?.(value);
  }, [onChange]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>((event) => {
    const { key } = event;

    if (onKeyDown) {
      const {
        altKey, ctrlKey, metaKey, shiftKey,
      } = event;

      onKeyDown?.({
        key, altKey, ctrlKey, metaKey, shiftKey,
      });
    }
    if (key === 'Enter') {
      setIsConfirmed(true);
      onOk();
    }
  }, [onKeyDown, onOk]);

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
      <p>
        {children}
      </p>
      <input
        ref={refInput}
        disabled={isConfirmed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </OkCancelModal>
  );
};

export default AskInputModal;
