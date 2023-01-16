import React from 'react';

import { FCWithChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

const WithTextShadow: FCWithChildren = ({ children }) => (
  <span className={styles.shadow}>
    {children}
  </span>
);

export default WithTextShadow;
