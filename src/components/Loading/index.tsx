import classnames from 'classnames';
import React, {
  FunctionComponent, ReactNode, useEffect, useMemo, useState,
} from 'react';

import styles from './styles.module.scss';

interface LoadingProps {
  show?: boolean;
  fullscreen?: boolean;
  highlight?: boolean;
  children?: ReactNode;
}

const Loading: FunctionComponent<LoadingProps> = ({
  children,
  show = !!children,
  fullscreen = false,
  highlight = false,
}) => {
  const className = useMemo(() => (
    classnames(styles.loading, {
      [styles.fullscreen]: fullscreen,
      [styles.highlight]: highlight,
      [styles.show]: show,
    })
  ), [fullscreen, highlight, show]);

  const [Message, setMessage] = useState<ReactNode>(children ?? 'Loading');

  useEffect(() => {
    if (children || show) {
      setMessage(children);
    }
  }, [children, show]);

  return (
    <div className={className}>
      <div className={styles.message}>
        {Message}
      </div>
    </div>
  );
};

export default Loading;
