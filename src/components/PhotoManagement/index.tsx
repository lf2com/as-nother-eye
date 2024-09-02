import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Clickable from '@/components/Clickable';
import Modal, { ModalButton } from '@/components/Modal';
import PhotoList from '@/components/PhotoList';
import dateToStr from '@/utils/dateToStr';
import twClassNames from '@/utils/twClassNames';

import Photo from './components/Photo';

export interface PhotoManagementProps {
  photos: Blob[];
  onShare: (photos: File[]) => void;
  onSave: (photos: File[]) => void;
  show?: boolean;
  className?: string;
}

const PhotoManagement: FC<PhotoManagementProps> = ({
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

  const togglePhoto = useCallback(
    (photoIndex: number) => {
      const index = selectedPhotoIndexs.indexOf(photoIndex);

      if (index === -1) {
        setSelectedPhotoIndexs(selectedPhotoIndexs.concat(photoIndex));
      } else {
        setSelectedPhotoIndexs(
          selectedPhotoIndexs
            .slice(0, index)
            .concat(selectedPhotoIndexs.slice(index + 1))
        );
      }
    },
    [selectedPhotoIndexs]
  );

  const shareButton = useMemo(
    () => (
      <ModalButton
        key="share-button"
        disabled={selectedPhotoIndexs.length === 0}
        onClick={() => {
          onShare(selectedPhotos);
        }}
      >
        Share
      </ModalButton>
    ),
    [selectedPhotoIndexs.length, onShare, selectedPhotos]
  );

  const saveButton = useMemo(
    () => (
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
    ),
    [onSave, selectedPhotoIndexs.length, selectedPhotos]
  );

  const buttons = useMemo(
    () => [shareButton, saveButton],
    [shareButton, saveButton]
  );

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
        className={twClassNames('box-border', className)}
        onClick={showPhotoManagement}
      >
        <PhotoList aspectRatio={aspectRatio} photos={photos} />
      </Clickable>

      <Modal
        show={showModal}
        bodyClassName="grid grid-cols-3 gap-[0.75em]"
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
