import type { ComponentProps, FC, PropsWithChildren } from 'react';
import React from 'react';

import twClassNames from '@/utils/twClassNames';

type ButtonProps = ComponentProps<'button'>;

interface ClickableProps extends ButtonProps {
  onClick: ButtonProps['onClick'];
  stopPropagation?: boolean;
  isActive?: boolean;
}

const Clickable: FC<PropsWithChildren<ClickableProps>> = ({
  className,
  disabled,
  isActive,
  ...restProps
}) => (
  <button
    disabled={disabled}
    className={twClassNames(
      '[-webkit-tap-highlight-color:transparent] select-none bg-black/0 cursor-pointer',
      {
        'cursor-not-allowed': disabled,
        'active:brightness-90 pointer-events-auto': !disabled,
        'brightness-90': isActive,
      },
      className
    )}
    {...restProps}
  />
);

export default Clickable;
