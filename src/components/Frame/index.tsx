import classnames from 'classnames';
import React, { AllHTMLAttributes, FunctionComponent, PropsWithChildren } from 'react';

import styles from './styles.module.scss';

interface FrameProps extends AllHTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Frame: FunctionComponent<PropsWithChildren<FrameProps>> = ({
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
