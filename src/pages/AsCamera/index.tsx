import React, {
  FunctionComponent, useCallback, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';

import PhotoList from '../../components/PhotoList';
import Tag from '../../components/Tag';
import CameraView, { CameraViewProps } from '../components/CameraView';

import Logger from '../../utils/logger';
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
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Blob[]>([]);

  const photoAspectRatio = useMemo<number>(() => {
    if (!localStream) {
      return 1;
    }

    const videoTracks = localStream.getVideoTracks();

    if (videoTracks.length === 0) {
      return 1;
    }

    const { width, height } = videoTracks[0].getCapabilities();

    return (width?.max ?? 1) / (height?.max ?? 1);
  }, [localStream]);

  const createShareUrl = useCallback<CameraViewProps['shareUrlGenerator']>((id) => (
    new URL(`/photoer/${id}`, globalThis.location.href).toString()
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
      <div className={styles['photo-list']}>
        <PhotoList
          aspectRatio={photoAspectRatio}
          photos={photos}
        />
      </div>
    </CameraView>
  );
};

export default Camera;
