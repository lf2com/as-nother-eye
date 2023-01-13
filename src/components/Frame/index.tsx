import classnames from 'classnames';
import React, { AllHTMLAttributes } from 'react';

import { FCWithClassNameAndChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

interface FrameProps extends AllHTMLAttributes<HTMLDivElement> {
}

const Frame: FCWithClassNameAndChildren<FrameProps> = ({
  className,
  children,
  ...restProps
}) => (
  <div
    className={classnames(styles.frame, className)}
    {...restProps}
  >
    {children}
  </div>
);

export default Frame;
