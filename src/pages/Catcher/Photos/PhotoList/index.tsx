import type { FC } from 'react';
import { useMemo, useState } from 'react';

import CheckboxWithIndeterminate from '@/components/common/CheckboxWithIndeterminate';
import { DoubleBtnModal, ModalButton } from '@/components/common/Modal';

import Photo from './Photo';

const SELECTED_LIMITATION = 10;

interface PhotoListProps {
  urls: string[];
  onOk: (urls: string[]) => Promise<void>;
  onClose: () => void;
}

const PhotoList: FC<PhotoListProps> = ({ urls, onOk, onClose }) => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const selectedUrls = useMemo(
    () => urls.filter((_, index) => selectedIndexes.includes(index)),
    [selectedIndexes, urls]
  );
  const selectedCount = selectedUrls.length;
  const total = urls.length;
  const hitSelectLimitation = selectedCount === SELECTED_LIMITATION;

  const sendBtnContent = useMemo(() => {
    switch (selectedCount) {
      case 0:
        return 'Select photo';

      case 1:
        return 'Send 1 photo';

      case total:
        return 'Send all photos';

      default:
        return `Send ${selectedCount} photos`;
    }
  }, [selectedCount, total]);

  return (
    <DoubleBtnModal
      className="grid grid-cols-photo-list gap-2"
      btnAContent="Cancel"
      btnBContent={sendBtnContent}
      disabledB={0 === selectedCount}
      onClickA={() => onClose()}
      onClickB={async () => {
        await onOk(selectedUrls);
        setSelectedIndexes([]);
      }}
      header={
        <ModalButton
          className="w-full flex justify-center items-center gap-1 py-1"
          onClick={() => {
            setSelectedIndexes(
              !selectedCount && !hitSelectLimitation && selectedCount < total
                ? Array.from(
                    { length: SELECTED_LIMITATION },
                    (_, index) => index
                  )
                : []
            );
          }}
        >
          <CheckboxWithIndeterminate
            checked={selectedCount === total}
            indeterminate={!!selectedCount && selectedCount < total}
            onChange={() => undefined}
          />
          Select all
        </ModalButton>
      }
    >
      {urls.map((url, index) => {
        const urlIndex = selectedIndexes.indexOf(index);
        const selected = urlIndex !== -1;
        const disabled = hitSelectLimitation && !selected;

        return (
          <Photo
            key={url}
            url={url}
            disabled={disabled}
            focused={selected}
            onClick={() => {
              setSelectedIndexes(prev =>
                selected
                  ? prev.slice(0, urlIndex).concat(prev.slice(urlIndex + 1))
                  : prev.concat(index)
              );
            }}
          />
        );
      })}
    </DoubleBtnModal>
  );
};

export default PhotoList;
