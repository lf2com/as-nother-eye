import type { FC, ReactEventHandler } from 'react';
import React, { useCallback, useState } from 'react';

import twClassNames from '@/utils/twClassNames';

interface PhotoItemProps {
  url: string;
  onShown?: () => void;
}

const Photo: FC<PhotoItemProps> = ({ url, onShown }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback<ReactEventHandler<HTMLImageElement>>(() => {
    setIsLoaded(true);
  }, []);

  const handleShowAnimationEnd = useCallback(() => {
    onShown?.();
  }, [onShown]);

  return (
    <div
      className={twClassNames(
        'outline outline-1 outline-black border-[0.2em] border-white',
        {
          'opacity-0 pointer-events-none z-[1]': !isLoaded,
          'animate-show z-10': isLoaded,
        }
      )}
      onAnimationEnd={handleShowAnimationEnd}
    >
      <img className="w-full block" src={url} onLoad={onLoad} />
    </div>
  );
};

export default Photo;
