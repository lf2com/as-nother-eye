import React, {
  FunctionComponent, useCallback, useMemo, useState,
} from 'react';

import Photo from './components/Photo';

import ModalButton from '../Button';

import Modal, { ModalBasicProps } from '..';
import styles from './styles.module.scss';

export interface PhotoManagementModalProps {
  show: boolean;
  photos: Blob[];
  onClickOutside: Required<ModalBasicProps>['onClickOutside'];
  onShare: (photos: Blob[]) => void;
  onSave: (photos: Blob[]) => void;
}

const PhotoManagementModal: FunctionComponent<PhotoManagementModalProps> = ({
  show,
  photos,
  onClickOutside,
  onShare,
  onSave,
}) => {
  const [selectedPhotoIndexs, setSelectedPhotoIndexs] = useState<number[]>([]);

  const selectedPhotos = useMemo(() => (selectedPhotoIndexs
    .slice()
    .sort((a, b) => a - b)
    .map((photoIndex) => new File([photos[photoIndex]], ''))
  ), [photos, selectedPhotoIndexs]);

  const togglePhoto = useCallback((photoIndex: number) => {
    const index = selectedPhotoIndexs.indexOf(photoIndex);

    if (index === -1) {
      setSelectedPhotoIndexs(selectedPhotoIndexs.concat(photoIndex));
    } else {
      setSelectedPhotoIndexs((selectedPhotoIndexs
        .slice(0, index)
        .concat(selectedPhotoIndexs.slice(index + 1))
      ));
    }
  }, [selectedPhotoIndexs]);

  const shareButton = useMemo(() => (
    <ModalButton
      disabled={selectedPhotoIndexs.length === 0}
      onClick={() => {
        onShare(selectedPhotos);
      }}
    >
      Share
    </ModalButton>
  ), [selectedPhotoIndexs.length, onShare, selectedPhotos]);

  const saveButton = useMemo(() => (
    <ModalButton
      highlight
      disabled={selectedPhotoIndexs.length === 0}
      onClick={() => {
        onSave(selectedPhotos);
      }}
    >
      Save
    </ModalButton>
  ), [onSave, selectedPhotoIndexs.length, selectedPhotos]);

  const buttons = useMemo(() => [shareButton, saveButton], [shareButton, saveButton]);

  return (
    <Modal
      show={show}
      className={styles['photo-management-modal']}
      hideOnClickOutside={false}
      onClickOutside={onClickOutside}
      buttons={buttons}
    >
      {photos.map((photoBlob, photoIndex) => (
        <Photo
          key={`photo-${photoIndex}`}
          photo={photoBlob}
          selected={selectedPhotoIndexs.includes(photoIndex)}
          onClick={() => togglePhoto(photoIndex)}
        />
      ))}
    </Modal>
  );
};

export default PhotoManagementModal;
