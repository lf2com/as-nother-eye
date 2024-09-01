import classNames from 'classnames';
import type { FC } from 'react';
import React, { useEffect, useMemo } from 'react';

interface PhotoProps {
  photo: File | Blob;
  selected: boolean;
  onClick: () => void;
}

const Photo: FC<PhotoProps> = ({ photo, selected, onClick }) => {
  const photoUrl = useMemo(() => URL.createObjectURL(photo), [photo]);

  useEffect(
    () => () => {
      URL.revokeObjectURL(photoUrl);
    },
    [photoUrl]
  );

  return (
    <img
      className={classNames(
        'w-full box-border border border-white object-contain',
        { 'outline outline-[0.2em] outline-[#69f]': selected }
      )}
      src={photoUrl}
      onClick={onClick}
    />
  );
};

export default Photo;
