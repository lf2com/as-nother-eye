import classNames from 'classnames';
import type { FC } from 'react';
import React, { useEffect, useMemo } from 'react';

import styles from './styles.module.scss';

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
      className={classNames(styles.photo, {
        [styles.selected]: selected,
      })}
      src={photoUrl}
      onClick={onClick}
    />
  );
};

export default Photo;
