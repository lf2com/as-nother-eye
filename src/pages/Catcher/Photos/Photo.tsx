import type { FC } from 'react';
import { useState } from 'react';

import twClassNames from '@/utils/twClassNames';

const DEG_BASE = 15;
const OFFSET_BASE = 10;

interface PhotoProps {
  url: string;
}

const Photo: FC<PhotoProps> = ({ url }) => {
  const [isReady, setIsReady] = useState(false);
  const [{ deg, offset }] = useState(() => ({
    deg: DEG_BASE * (-1 + 2 * Math.random()),
    offset: {
      x: OFFSET_BASE * (-1 + 2 * Math.random()),
      y: OFFSET_BASE * (-1 + 2 * Math.random()),
    },
  }));

  return (
    <div
      className={twClassNames(
        'absolute right-0 bottom-0 pointer-events-auto',
        isReady ? 'animate-show' : 'invisible'
      )}
    >
      <div
        className="border-[.2rem] border-white shadow-[0_0_.2rem_0_#000]"
        style={{
          transform: `translate3d(${offset.x}%, ${offset.y}%, 0) rotate(${deg}deg)`,
        }}
      >
        <img
          src={url}
          className="object-contain border border-black"
          onLoad={() => {
            setIsReady(true);
          }}
        />
      </div>
    </div>
  );
};

export default Photo;
