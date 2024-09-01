import React from 'react';

import WithTextShadow from '@/components/WithTextShadow';
import type { FCWithChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

const Tag: FCWithChildren = ({ children }) => (
  <div className={styles.tag}>
    <WithTextShadow>{children}</WithTextShadow>
  </div>
);

export default Tag;
