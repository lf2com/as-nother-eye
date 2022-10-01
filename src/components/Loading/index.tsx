import classnames from 'classnames';
import React, { FunctionComponent, useMemo } from 'react';

import styles from './styles.module.scss';

interface LoadingProps {
  show?: boolean;
  fullscreen?: boolean;
  children?: React.ReactNode;
}

const Loading: FunctionComponent<LoadingProps> = ({
  show = true,
  fullscreen = false,
  children,
}) => {
  const className = useMemo(() => (
    classnames(styles.loading, {
      [styles.fullscreen]: fullscreen,
      [styles.show]: show,
    })
  ), [show, fullscreen]);

  return (
    <div className={className}>
      <div className={styles.message}>
        {children ?? 'Loading'}
      </div>
    </div>
  );
};

export default Loading;
