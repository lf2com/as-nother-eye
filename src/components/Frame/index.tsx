import classNames from 'classnames';
import type { ComponentProps, FC, PropsWithChildren } from 'react';
import React from 'react';

interface FrameProps extends ComponentProps<'div'> {}

const Frame: FC<PropsWithChildren<FrameProps>> = ({
  className,
  children,
  ...restProps
}) => (
  <div
    className={classNames('relative w-full h-full', className)}
    {...restProps}
  >
    {children}
  </div>
);

export default Frame;
