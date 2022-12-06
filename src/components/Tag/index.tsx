import React, { FunctionComponent } from 'react';

import styles from './styles.module.scss';

interface TagProps {
  children: React.ReactNode;
}

const Tag: FunctionComponent<TagProps> = ({ children }) => (
  <div className={styles.tag}>
    {children}
  </div>
);

export default Tag;
