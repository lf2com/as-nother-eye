import React from 'react';

import ShadowWrapper from '../ShadowWrapper';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';
import styles from './styles.module.scss';

const Tag: FunctionComponentWithChildren = ({ children }) => (
  <div className={styles.tag}>
    <ShadowWrapper>
      {children}
    </ShadowWrapper>
  </div>
);

export default Tag;
