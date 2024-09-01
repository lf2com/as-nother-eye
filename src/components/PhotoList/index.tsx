import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { FCWithClassName } from '@/types/ComponentProps';

import Photo from './components/Photo';
import styles from './styles.module.scss';

interface PhotoListProps {
  aspectRatio?: number;
  photos: (Blob | File)[];
}

const PhotoList: FCWithClassName<PhotoListProps> = ({
  photos,
  className,
  aspectRatio = 1,
}) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const style = useMemo(
    () =>
      ({
        '--aspect-ratio': aspectRatio,
      }) as CSSProperties,
    [aspectRatio]
  );
  const lastPhoto = useMemo(() => photos[photos.length - 1], [photos]);
  const lastPhotoUrl = useMemo(
    () => (lastPhoto ? URL.createObjectURL(lastPhoto) : null),
    [lastPhoto]
  );

  const removePrevPhoto = useCallback(() => {
    setPhotoUrls(prevUrls => prevUrls.slice(1, prevUrls.length));
  }, []);

  useEffect(() => {
    if (lastPhotoUrl) {
      setPhotoUrls(prevUrls => prevUrls.concat(lastPhotoUrl));
    }

    return () => {
      if (lastPhotoUrl) {
        URL.revokeObjectURL(lastPhotoUrl);
      }
    };
  }, [lastPhotoUrl]);

  return (
    <div className={classNames(styles['photo-list'], className)} style={style}>
      {photoUrls.map((url, urlIndex) => (
        <Photo
          key={url}
          url={url}
          onShown={urlIndex > 0 ? removePrevPhoto : undefined}
        />
      ))}
    </div>
  );
};

export default PhotoList;
