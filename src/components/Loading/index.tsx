import classnames from 'classnames';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';

import styles from './styles.module.scss';

interface LoadingProps {
  show?: boolean;
  fullscreen?: boolean;
  highlight?: boolean;
  children?: ReactNode;
}

const Loading: FunctionComponent<LoadingProps> = ({
  show = true,
  fullscreen = false,
  highlight = true,
  children,
}) => {
  const className = useMemo(() => (
    classnames(styles.loading, {
      [styles.fullscreen]: fullscreen,
      [styles.highlight]: highlight,
      [styles.show]: show,
    })
  ), [fullscreen, highlight, show]);

  return (
    <div className={className}>
      <div className={styles.message}>
        {children ?? 'Loading'}
      </div>
    </div>
  );
};

export default Loading;
