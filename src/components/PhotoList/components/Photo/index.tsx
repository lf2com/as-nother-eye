import classNames from 'classnames';
import React, {
  FC, ReactEventHandler, useCallback, useState,
} from 'react';

import styles from './styles.module.scss';

interface PhotoItemProps {
  url: string;
  onShown?: () => void;
}

const Photo: FC<PhotoItemProps> = ({
  url,
  onShown,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback<ReactEventHandler<HTMLImageElement>>(() => {
    setIsLoaded(true);
  }, []);

  const handleShowAnimationEnd = useCallback(() => {
    onShown?.();
  }, [onShown]);

  return (
    <div
      className={classNames(styles.photo, {
        [styles.loaded]: isLoaded,
      })}
      onAnimationEnd={handleShowAnimationEnd}
    >
      <img
        src={url}
        onLoad={onLoad}
      />
    </div>
  );
};

export default Photo;
