import React from 'react';

import { FunctionComponentWithChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

const WithTextShadow: FunctionComponentWithChildren = ({ children }) => (
  <span className={styles.shadow}>
    {children}
  </span>
);

export default WithTextShadow;
