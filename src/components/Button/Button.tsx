import type { ComponentProps, FC } from 'react';
import React from 'react';

import twClassNames from '@/utils/twClassNames';

type ButtonProps = ComponentProps<'button'>;

const Button: FC<ButtonProps> = ({ className, ...restProps }) => (
  <button
    className={twClassNames(
      'px-1 border border-black disabled:opacity-10 pointer-events-auto',
      className
    )}
    {...restProps}
  />
);

export default Button;
