import type { FC, PropsWithChildren } from 'react';
import { useCallback, useRef, useState } from 'react';

import useMount from '@/hooks/useMount';

import DoubleBtnModal from './DoubleBtnModal';

interface InputValueModalProps extends PropsWithChildren {
  onOk: (value: string | null) => Promise<void> | void;
  onCancel: () => void;
}

const InputValueModal: FC<InputValueModalProps> = ({
  children,
  onCancel,
  onOk,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHandling, setIsHandling] = useState(false);

  const handleOk = useCallback(async () => {
    setIsHandling(true);
    await onOk(inputRef.current?.value || null);
    setIsHandling(false);
  }, [onOk]);

  useMount(() => {
    inputRef.current?.focus();
  });

  return (
    <DoubleBtnModal
      btnAContent="OK"
      btnBContent="Cancel"
      onClickA={handleOk}
      onClickB={() => onCancel()}
      className="flex flex-col gap-2"
    >
      <div>{children}</div>
      <input
        ref={inputRef}
        disabled={isHandling}
        className="border border-black"
        onKeyDown={({ key }) => {
          if (/\benter\b/i.test(key)) {
            handleOk();
          }
        }}
      />
    </DoubleBtnModal>
  );
};

export default InputValueModal;
