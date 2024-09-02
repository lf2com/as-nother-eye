import type { ComponentProps, FC } from 'react';
import React from 'react';

import Clickable from '@/components/Clickable';
import twClassNames from '@/utils/twClassNames';

type ButtonProps = ComponentProps<typeof Clickable>;

const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <Clickable
    className={twClassNames(
      'p-[1em] rounded-[0.5em] border-[0.5em] border-t-white/25 border-r-black/25 border-b-black/25 border-l-white/25',
      'bg-[#69f] text-white inline-block',
      'active:border-t-black/25 active:border-r-white/25 active:border-b-white/25 active:border-l-black/25',
      'disabled:bg-[#ccc]',
      className
    )}
    {...props}
  />
);

export default Button;
