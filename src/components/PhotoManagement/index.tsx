import classnames from 'classnames';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import ModalButton from '../Modal/components/Button';
import Photo from './components/Photo';

import dateToStr from '../../utils/dateToStr';

import Clickable from '../Clickable';
import Modal from '../Modal';
import PhotoList from '../PhotoList';

import { FunctionComponentWithClassName } from '../../types/ComponentProps';
import styles from './styles.module.scss';

export interface PhotoManagementProps {
  photos: Blob[];
  onShare: (photos: File[]) => void;
  onSave: (photos: File[]) => void;
  show?: boolean;
}

const PhotoManagement: FunctionComponentWithClassName<PhotoManagementProps> = ({
  show: defShowModal = false,
  className,
  photos,
  onShare,
  onSave,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
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

  const showPhotoManagement = () => {
    setShowModal(true);
  };

  const hidePhotoManagement = () => {
    setShowModal(false);
  };

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

  useEffect(() => {
    const [photoBlob] = photos;

    if (photoBlob) {
      const image = new Image();
      const url = URL.createObjectURL(photoBlob);

      image.addEventListener('load', () => {
        const { naturalWidth, naturalHeight } = image;

        setAspectRatio(naturalWidth / naturalHeight);
        URL.revokeObjectURL(url);
      });
      image.src = url;
    }
  }, [photos]);

  useEffect(() => {
    setShowModal(defShowModal);
  }, [defShowModal]);

  return (
    <>
      <Clickable
        className={classnames(styles['photo-management-button'], className)}
        onClick={showPhotoManagement}
      >
        <PhotoList
          aspectRatio={aspectRatio}
          photos={photos}
        />
      </Clickable>

      <Modal
        show={showModal}
        className={styles['photo-management-modal']}
        hideOnClickOutside={false}
        onClickOutside={hidePhotoManagement}
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
    </>
  );
};

export default PhotoManagement;
