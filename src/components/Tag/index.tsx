import classnames from 'classnames';
import React from 'react';

import { FunctionComponentWithClassNameAndChildren } from '../../types/ComponentProps';
import styles from './styles.module.scss';

interface TagProps {
  children: React.ReactNode;
}

const Tag: FunctionComponentWithClassNameAndChildren<TagProps> = ({
  className,
  children,
}) => (
  <div className={classnames(styles.tag, className)}>
    <span className={styles.text}>
      {children}
    </span>
  </div>
);

export default Tag;
