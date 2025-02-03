import type { ComponentProps, FC } from 'react';

import twClassNames from '@/utils/twClassNames';

interface ClickableProps extends ComponentProps<'button'> {
  stopPropagation?: boolean;
  isActive?: boolean;
}

const Clickable: FC<ClickableProps> = ({
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
