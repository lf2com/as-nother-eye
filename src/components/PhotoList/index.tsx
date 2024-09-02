import type { CSSProperties, FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import twClassNames from '@/utils/twClassNames';

import Photo from './components/Photo';

interface PhotoListProps {
  aspectRatio?: number;
  photos: (Blob | File)[];
  className?: string;
}

const PhotoList: FC<PhotoListProps> = ({
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
    <div
      className={twClassNames(
        'relative left-1/2 -translate-x-1/2 w-full h-auto box-border text-[1em] flex flex-col-reverse',
        '[&:nth-child(2)]:absolute',
        className
      )}
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
