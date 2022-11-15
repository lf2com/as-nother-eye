import classnames from 'classnames';
import React, {
  CSSProperties,
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';

import Photo from './components/Photo';

import styles from './styles.module.scss';

interface PhotoListProps {
  className?: string;
  aspectRatio?: number;
  photos: (Blob | File)[];
}

const PhotoList: FunctionComponent<PhotoListProps> = ({
  photos,
  className,
  aspectRatio = 1,
}) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const style = useMemo(() => ({
    '--aspect-ratio': aspectRatio,
  }) as CSSProperties, [aspectRatio]);
  const lastPhoto = useMemo(() => photos[photos.length - 1], [photos]);
  const lastPhotoUrl = useMemo(() => (
    lastPhoto ? URL.createObjectURL(lastPhoto) : null
  ), [lastPhoto]);

  const removePrevPhoto = useCallback(() => {
    setPhotoUrls((prevUrls) => prevUrls.slice(1, prevUrls.length));
  }, []);

  useEffect(() => {
    if (lastPhotoUrl) {
      setPhotoUrls((prevUrls) => prevUrls.concat(lastPhotoUrl));
    }

    return () => {
      if (lastPhotoUrl) {
        URL.revokeObjectURL(lastPhotoUrl);
      }
    };
  }, [lastPhotoUrl]);

  console.log(100, {
    photoUrls,
    lastPhotoUrl,
  });

  return (
    <div
      className={classnames(styles['photo-list'], className)}
      style={style}
    >
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
