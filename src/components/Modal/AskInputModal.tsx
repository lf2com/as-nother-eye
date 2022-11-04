import React, {
  ChangeEventHandler, FunctionComponent, PropsWithChildren, useCallback, useState,
} from 'react';

import OkCancelModal from './OkCancelModal';

interface AskInputModalProps {
  show: boolean;
  onConfirm: (input: string) => void;
  onCancel: () => void;
  onChange?: (input: string) => void;
}

const AskInputModal: FunctionComponent<PropsWithChildren<AskInputModalProps>> = ({
  show,
  onChange,
  onConfirm,
  onCancel,
  children,
}) => {
  const [inputValue, setInputValue] = useState('');

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

  return (
    <OkCancelModal
      show={show}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p>
        {children}
      </p>
      <input onChange={handleChange} />
    </OkCancelModal>
  );
};

export default AskInputModal;
