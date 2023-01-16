import classNames from 'classnames';
import React, {
  FC, ReactNode, useEffect, useState,
} from 'react';

import styles from './styles.module.scss';

interface LoadingProps {
  show?: boolean;
  fullscreen?: boolean;
  highlight?: boolean;
  children?: ReactNode;
}

const Loading: FC<LoadingProps> = ({
  children,
  show = !!children,
  fullscreen = false,
  highlight = false,
}) => {
  const [lastContent, setLastContent] = useState(children);

  useEffect(() => {
    if (children !== undefined) {
      setLastContent(children);
    }
  }, [children]);

  return (
    <div className={
      classNames(styles.loading, {
        [styles.fullscreen]: fullscreen,
        [styles.highlight]: highlight,
        [styles.hide]: !show,
      })
    }>
      <div className={styles.message}>
        {lastContent}
      </div>
    </div>
  );
};

export default Loading;
