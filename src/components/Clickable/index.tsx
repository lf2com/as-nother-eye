import type { ComponentProps, FC, PropsWithChildren } from 'react';
import React from 'react';

import twClassNames from '@/utils/twClassNames';

interface ClickableProps extends ComponentProps<'button'> {
  stopPropagation?: boolean;
}

const Clickable: FC<PropsWithChildren<ClickableProps>> = ({
  className,
  ...restProps
}) => (
  <button
    className={twClassNames(
      '[-webkit-tap-highlight-color:transparent] select-none bg-black/0 cursor-pointer',
      'disabled:cursor-not-allowed [&:not(:disabled)]:active:brightness-95',
      className
    )}
    {...restProps}
  />
);

export default Clickable;
