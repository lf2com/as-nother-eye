import classnames from 'classnames';
import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';

import styles from './styles.module.scss';

interface PhotoListProps {
  photos: (Blob | File)[];
  className?: string;
  size?: number;
}

interface PhotoItemProps {
  url: string;
}

const PhotoItem: FunctionComponent<PhotoItemProps> = React.memo(
  ({ url }) => {
    const [heightRatio, setHeightRatio] = useState(1);
    const rotateDegree = useMemo(() => (10 * 2 * (Math.random() - 0.5)), []);

    const style = useMemo(() => ({
      '--x-deg': `${rotateDegree}deg`,
      '--height-perc': `${Math.round(100 * heightRatio)}%`,
    } as React.CSSProperties), [heightRatio, rotateDegree]);

    const onLoad = useCallback<React.ReactEventHandler<HTMLImageElement>>((event) => {
      const target = event.target as HTMLImageElement;
      const { naturalWidth, naturalHeight } = target;

      setHeightRatio(naturalHeight / naturalWidth);
    }, []);

    return (
      <div className={styles.photo} style={style}>
        <img src={url} onLoad={onLoad} />
      </div>
    );
  },
);

const PhotoList: FunctionComponent<PhotoListProps> = ({
  photos,
  className = '',
  size = photos.length,
}) => {
  const photoUrls = useMemo(() => (photos
    .slice(-size)
    .map((file) => URL.createObjectURL(file))
  ), [photos, size]);

  useEffect(() => (
    () => {
      photoUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    }
  ), [photoUrls]);

  return (
    <div className={classnames(styles['photo-list'], className)}>
      {photoUrls.map((url) => (
        <PhotoItem key={url} url={url} />
      ))}
    </div>
  );
};

export default PhotoList;
