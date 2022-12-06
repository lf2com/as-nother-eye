import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import CameraView, { CameraViewProps } from '../../components/CameraView';
import Tag from '../../components/Tag';
import PhotoManagement, { PhotoManagementProps } from '../components/PhotoManagement';
import ShareCamera from './components/ShareCamera';

import createRoutePath from '../../utils/createRoutePath';
import { downloadFiles } from '../../utils/downloadFile';
import Logger from '../../utils/logger';
import shareData from '../../utils/shareData';
import { startStream, switchCamera } from '../../utils/userMedia';
import wait from '../../utils/wait';

import styles from './styles.module.scss';

interface CameraProps {
}

const logger = new Logger({ tag: '[Camera]' });

const Camera: FunctionComponent<CameraProps> = () => {
  const params = useParams();
  const { targetId } = params;
  const {
    connector,
    id: connectorId,
    peerId,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [disabledSwitchCamera, setDisabledSwitchCamera] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [photos, setPhotos] = useState<Blob[]>([]);
  const cameraUrl = useMemo(() => createRoutePath(`/photoer/${connectorId}`), [connectorId]);

  const captureCamera = useCallback(async () => {
    if (!localStream) {
      return null;
    }

    const track = localStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const photoBlob = await imageCapture.takePhoto({
      fillLightMode: 'auto', // 'auto' | 'off' | 'flash'
      redEyeReduction: true,
    });

    await wait(1000);

    return photoBlob;
  }, [localStream]);

  const takePhoto = useCallback(async () => {
    if (!localStream || isSwitchingCamera || takingPhoto) {
      return;
    }

    setTakingPhoto(true);

    const photoBlob = await captureCamera();

    setTakingPhoto(false);

    if (photoBlob) {
      setPhotos((prevPhotos) => prevPhotos.concat(photoBlob));
    }
  }, [localStream, isSwitchingCamera, takingPhoto, captureCamera]);

  const handleSwitchCamera = useCallback<Required<CameraViewProps>['onSwitchCamera']>(async () => {
    if (!localStream) {
      return;
    }

    setDisabledSwitchCamera(true);

    try {
      setIsSwitchingCamera(true);
      await switchCamera(localStream);
      setIsSwitchingCamera(false);

      if (peerId) {
        await connector.call(peerId, localStream);
      }
    } catch (error) {
      notice(`${error}`);
    }

    setDisabledSwitchCamera(false);
  }, [connector, localStream, notice, peerId]);

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

        case 'switchcamera':
          handleSwitchCamera({}).finally(() => {
            connector.sendMessage(peerId!, '#switchcamera');
          });
          break;

        default:
          break;
      }
    }
  }, [connector, handleSwitchCamera, peerId, takePhoto]);

  const onCall: CameraViewProps['onCall'] = () => true;

  const onHangUp = useCallback<CameraViewProps['onHangUp']>(() => {
    logger.log('Closed');
  }, []);

  const getStream = useCallback<Required<CameraViewProps>['mediaStreamGenerator']>(async () => (
    startStream({
      video: true,
    })
  ), []);

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

  const onSaveSelectedPhotos = useCallback<PhotoManagementProps['onSave']>((selectedPhotos) => {
    downloadFiles(selectedPhotos);
  }, []);

  const onShareSelectedPhotos = useCallback<PhotoManagementProps['onShare']>(async (selectedPhotos) => {
    try {
      await shareData({
        files: selectedPhotos,
      });
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice]);

  useEffect(() => {

  });

  return (
    <CameraView
      className={styles.camera}
      targetId={targetId}
      mediaStreamGenerator={getStream}
      mediaStreamConverter={convertStream}
      onShot={onPhoto}
      onCall={onCall}
      onData={onData}
      onHangUp={onHangUp}
      onSwitchCamera={handleSwitchCamera}
      disabledSwitchCamera={disabledSwitchCamera}
      showTakePhotoAnimation={takingPhoto}
    >
      <Tag className={styles.tag}>
        Camera #{connectorId}

        <ShareCamera
          ask
          className={styles['share-camera']}
          cameraUrl={cameraUrl}
        />
      </Tag>

      <PhotoManagement
        className={styles['photo-list']}
        photos={photos}
        onShare={onShareSelectedPhotos}
        onSave={onSaveSelectedPhotos}
      />
    </CameraView>
  );
};

export default Camera;
