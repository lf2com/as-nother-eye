import classnames from 'classnames';
import React, { FunctionComponent, PropsWithChildren } from 'react';

import styles from './styles.module.scss';

interface FrameProps {
  className?: string;
}

const Frame: FunctionComponent<PropsWithChildren<FrameProps>> = ({
  className,
  children,
}) => (
  <div className={classnames(styles.frame, className)}>
    {children}
  </div>
);

export default Frame;
