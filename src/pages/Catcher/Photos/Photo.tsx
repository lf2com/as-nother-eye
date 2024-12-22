import type { FC } from 'react';
import { useState } from 'react';

import twClassNames from '@/utils/twClassNames';

const DEG_BASE = 15;

interface PhotoProps {
  url: string;
}

const Photo: FC<PhotoProps> = ({ url }) => {
  const [isReady, setIsReady] = useState(false);
  const [deg] = useState(() => DEG_BASE * (-1 + 2 * Math.random()));

  return (
    <div
      className={twClassNames(
        'absolute right-0 bottom-0 pointer-events-auto',
        isReady ? 'animate-show' : 'invisible'
      )}
    >
      <div
        className="border-[2vmin] border-white shadow-[0_0_1vmin_0_#000]"
        style={{ transform: `rotate(${deg}deg)` }}
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
