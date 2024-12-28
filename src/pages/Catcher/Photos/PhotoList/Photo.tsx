import type { FC } from 'react';

import LongPress from '@/components/LongPress';
import { SingleBtnModal } from '@/components/common/Modal';
import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import twClassNames from '@/utils/twClassNames';

const OVERLAY_ID = 'photo-preview';

interface PhotoProps {
  url: string;
  onClick: () => void;
  disabled?: boolean;
  focused?: boolean;
}

const Photo: FC<PhotoProps> = ({
  disabled = false,
  focused = false,
  url,
  onClick,
}) => {
  const { open, close } = useOverlayContext();

  return (
    <LongPress
      key={url}
      disabled={disabled}
      className={twClassNames('border border-black', {
        'outline outline-[.15rem] outline-amber-400': focused,
        'grayscale opacity-50': disabled,
      })}
      onClick={disabled ? undefined : onClick}
      onLongPress={() => {
        open(
          <SingleBtnModal
            btnContent="Close"
            onClick={() => {
              close(OVERLAY_ID);
            }}
            className="p-0"
          >
            <img src={url} />
          </SingleBtnModal>,
          {
            id: OVERLAY_ID,
          }
        );
      }}
    >
      <img src={url} />
    </LongPress>
  );
};

export default Photo;
