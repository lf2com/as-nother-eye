import React, {
  FunctionComponent, useCallback, useMemo, useState,
} from 'react';

import ModalButton from '../components/Button';
import Photo from './components/Photo';

import dateToStr from '../../../utils/dateToStr';

import Modal, { ModalBasicProps } from '..';
import styles from './styles.module.scss';

export interface PhotoManagementModalProps {
  show: boolean;
  photos: Blob[];
  onClickOutside: Required<ModalBasicProps>['onClickOutside'];
  onShare: (photos: File[]) => void;
  onSave: (photos: File[]) => void;
}

const PhotoManagementModal: FunctionComponent<PhotoManagementModalProps> = ({
  show,
  photos,
  onClickOutside,
  onShare,
  onSave,
}) => {
  const [selectedPhotoIndexs, setSelectedPhotoIndexs] = useState<number[]>([]);

  const selectedPhotos = useMemo(() => {
    const dateStr = dateToStr(new Date(), {
      ymdSplit: '',
      hmsSplit: '',
      ymdHmsSplit: '_',
    });

    return selectedPhotoIndexs
      .slice()
      .sort((a, b) => a - b)
      .map((photoIndex, index) => {
        const blob = photos[photoIndex];
        const { type } = blob;
        const filename = `photo_${dateStr}_${(index + 1).toString().padStart(2, '0')}.png`;

        return new File([blob], filename, { type });
      });
  }, [photos, selectedPhotoIndexs]);

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
      key="share-button"
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
      key="save-button"
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
      buttonOnlyOnce={false}
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
