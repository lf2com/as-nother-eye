import type { FC, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import twClassNames from '@/utils/twClassNames';

interface LoadingProps {
  show?: boolean;
  fullscreen?: boolean;
  highlight?: boolean;
  children?: ReactNode;
}

const Loading: FC<LoadingProps> = ({
  children,
  show = !!children,
  fullscreen = false,
  highlight = false,
}) => {
  const [lastContent, setLastContent] = useState(children);

  useEffect(() => {
    if (children !== undefined) {
      setLastContent(children);
    }
  }, [children]);

  return (
    <div
      className={twClassNames(
        'absolute top-0 right-0 bottom-0 left-0 z-[1000] bg-black/0 text-[1rem] flex justify-center items-center transition-all dur-[0.4s]',
        {
          fixed: fullscreen,
          'bg-black/50': highlight,
          'opacity-0 pointer-events-none blur-[0.1rem] delay-1000': !show,
        }
      )}
    >
      <div
        className={twClassNames(
          'w-full p-[1em] bg-white/85 text-black flex flex-col items-center opacity-[inherit] pointer-events-[inherit]',
          { 'animate-shining': show }
        )}
      >
        {lastContent}
      </div>
    </div>
  );
};

export default Loading;
