import classNames from 'classnames';
import type { ComponentProps } from 'react';
import React from 'react';

import type { FCWithClassNameAndChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

interface FrameProps extends ComponentProps<'div'> {}

const Frame: FCWithClassNameAndChildren<FrameProps> = ({
  className,
  children,
  ...restProps
}) => (
  <div className={classNames(styles.frame, className)} {...restProps}>
    {children}
  </div>
);

export default Frame;
