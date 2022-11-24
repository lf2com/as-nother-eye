import React, {
  FunctionComponent, useCallback, useEffect, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import Clickable from '../../components/Clickable';
import PhotoManagementModal, { PhotoManagementModalProps } from '../../components/Modal/PhotoManagementModal';
import PhotoList from '../../components/PhotoList';
import Tag from '../../components/Tag';
import CameraView, { CameraViewProps } from '../components/CameraView';

import { downloadFiles } from '../../utils/downloadFile';
import Logger from '../../utils/logger';
import shareData from '../../utils/shareData';
import { getCameras, startStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface CameraProps {
}

const logger = new Logger({ tag: '[Camera]' });

const Camera: FunctionComponent<CameraProps> = () => {
  const params = useParams();
  const { targetId } = params;
  const {
    id: connectorId,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [photoAspectRatio, setPhotoAspectRatio] = useState(1);
  const [showPhotoManagement, setShowPhotoManagement] = useState(false);
  const toShowPhotoManagement = useCallback(() => setShowPhotoManagement(true), []);
  const hidePhotoManagement = useCallback(() => setShowPhotoManagement(false), []);

  const createShareUrl = useCallback<CameraViewProps['shareUrlGenerator']>((id) => (
    new URL(`/#/photoer/${id}`, globalThis.location.href).toString()
  ), []);

  const takePhoto = useCallback(async () => {
    if (!localStream) {
      return;
    }

    const track = localStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    setTakingPhoto(true);

    const photoBlob = await imageCapture.takePhoto({
      fillLightMode: 'auto', // 'auto' | 'off' | 'flash'
      redEyeReduction: true,
    });

    setPhotos((prevPhotos) => prevPhotos.concat(photoBlob));
    setTakingPhoto(false);
  }, [localStream]);

  const onPhoto = takePhoto;

  const onData = useCallback<CameraViewProps['onData']>((data) => {
    const message = data as string;

    logger.log('DATA', data);

    if (/^#/.test(message)) {
      logger.log('MESSAGE', message.substring(1));
      switch (message.substring(1)) {
        case 'photo':
          logger.log('GOTO TAKE PHOTO');
          takePhoto();
          break;

        default:
          break;
      }
    }
  }, [takePhoto]);

  const onCall: CameraViewProps['onCall'] = () => true;

  const onHangUp = useCallback<CameraViewProps['onHangUp']>(() => {
    logger.log('Closed');
  }, []);

  const getStream = useCallback<Required<CameraViewProps>['mediaStreamGenerator']>(async () => {
    const cameras = await getCameras();
    const camera = cameras.find((info) => /^microsoft/i.test(info.label));

    return startStream({
      video: {
        deviceId: camera?.deviceId,
        // facingMode: 'environment',
      },
    });
  }, []);

  const convertStream = useCallback<Required<CameraViewProps>['mediaStreamConverter']>(({
    local,
    remote,
  }) => {
    setLocalStream(local);

    return {
      major: local,
      minor: remote,
    };
  }, []);

  const onSaveSelectedPhotos = useCallback<PhotoManagementModalProps['onSave']>((selectedPhotos) => {
    downloadFiles(selectedPhotos);
  }, []);

  const onShareSelectedPhotos = useCallback<PhotoManagementModalProps['onShare']>(async (selectedPhotos) => {
    try {
      await shareData({
        files: selectedPhotos,
      });
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice]);

  useEffect(() => {
    const [photoBlob] = photos;

    if (photoBlob) {
      const image = new Image();
      const url = URL.createObjectURL(photoBlob);

      image.addEventListener('load', () => {
        const { naturalWidth, naturalHeight } = image;

        setPhotoAspectRatio(naturalWidth / naturalHeight);
        URL.revokeObjectURL(url);
      });
      image.src = url;
    }
  }, [photos]);

  return (
    <CameraView
      className={styles.camera}
      targetId={targetId}
      shareText="Share Camera"
      connectText="Connect Photoer"
      askConnectText="Connect to photoer"
      waitingConnectionText="Waiting for photoer to connect"
      mediaStreamGenerator={getStream}
      mediaStreamConverter={convertStream}
      shareUrlGenerator={createShareUrl}
      onShot={onPhoto}
      onCall={onCall}
      onData={onData}
      onHangUp={onHangUp}
      showTakePhotoAnimation={takingPhoto}
    >
      <Tag>Camera #{connectorId}</Tag>
      <Clickable
        className={styles['photo-list']}
        onClick={toShowPhotoManagement}
      >
        <PhotoList
          aspectRatio={photoAspectRatio}
          photos={photos}
        />
      </Clickable>

      <PhotoManagementModal
        show={showPhotoManagement}
        photos={photos}
        onClickOutside={hidePhotoManagement}
        onShare={onShareSelectedPhotos}
        onSave={onSaveSelectedPhotos}
      />
    </CameraView>
  );
};

export default Camera;
