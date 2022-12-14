import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useMemo } from 'react';

import styles from './styles.module.scss';

interface PhotoProps {
  photo: File | Blob;
  selected: boolean;
  onClick: () => void;
}

const Photo: FunctionComponent<PhotoProps> = ({
  photo,
  selected,
  onClick,
}) => {
  const photoUrl = useMemo(() => URL.createObjectURL(photo), [photo]);

  useEffect(() => (
    () => {
      URL.revokeObjectURL(photoUrl);
    }
  ), [photoUrl]);

  return (
    <img
      className={classnames(styles.photo, {
        [styles.selected]: selected,
      })}
      src={photoUrl}
      onClick={onClick}
    />
  );
};

export default Photo;
