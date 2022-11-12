import React, {
  ChangeEventHandler, FunctionComponent, KeyboardEventHandler,
  PropsWithChildren, useCallback, useEffect, useRef, useState,
} from 'react';

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
}

const AskInputModal: FunctionComponent<PropsWithChildren<AskInputModalProps>> = ({
  show,
  onConfirm,
  onCancel,
  onChange,
  onKeyDown,
  children,
}) => {
  const [inputValue, setInputValue] = useState('');
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
      onOk();
    }
  }, [onKeyDown, onOk]);

  useEffect(() => {
    if (show) {
      refInput.current?.focus();
    }
  }, [show]);

  return (
    <OkCancelModal
      show={show}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p>
        {children}
      </p>
      <input
        ref={refInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </OkCancelModal>
  );
};

export default AskInputModal;
