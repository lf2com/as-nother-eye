import React from 'react';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';
import styles from './styles.module.scss';

const ShadowWrapper: FunctionComponentWithChildren = ({ children }) => (
  <span className={styles['shadow-wrapper']}>
    {children}
  </span>
);

export default ShadowWrapper;
