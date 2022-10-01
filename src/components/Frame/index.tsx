import React, { FunctionComponent } from 'react';

import styles from './styles.module.scss';

interface FrameProps {
  children: React.ReactNode;
}

const Frame: FunctionComponent<FrameProps> = ({ children }) => (
  <div className={styles.frame}>
    {children}
  </div>
);

export default Frame;
