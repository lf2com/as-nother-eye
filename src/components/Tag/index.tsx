import React from 'react';

import WithTextShadow from '@/components/WithTextShadow';

import { FunctionComponentWithChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

const Tag: FunctionComponentWithChildren = ({ children }) => (
  <div className={styles.tag}>
    <WithTextShadow>
      {children}
    </WithTextShadow>
  </div>
);

export default Tag;
