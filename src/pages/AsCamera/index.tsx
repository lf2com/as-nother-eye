import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';

import {
  OnCall, OnHangUp, OnMessage, useConnectionContext,
} from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import CameraView from '../../components/CameraView';
import Tag from '../../components/Tag';
import PhotoManagement, { PhotoManagementProps } from '../components/PhotoManagement';
import ShareCamera from './components/ShareCamera';

import createRoutePath from '../../utils/createRoutePath';
import { downloadFiles } from '../../utils/downloadFile';
import Logger from '../../utils/logger';
import shareData from '../../utils/shareData';
import {
  getNextCamera, minifyCameraStream, startStream, stopStream,
} from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Camera]' });

const Camera: FunctionComponent = () => {
  const {
    id: connectionId,
    isOnline,
    isDataConnected,
    isMediaConnected,
    peerId,
    call,
    sendMessage,
    setOnMessage,
    setOnCall,
    setOnHangUp,
  } = useConnectionContext();
  const { notice, askYesNo } = useModalContext();
  const [disableShutter, setDisableShutter] = useState<boolean>();
  const [disableSwitchCamera, setDisableSwitchCamera] = useState<boolean>();
  const [shutterAnimationId, setShutterAnimationId] = useState<number>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localMinStream, setLocalMinStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const cameraUrl = useMemo(() => createRoutePath(`/photoer/${connectionId}`), [connectionId]);

  const takePhoto = useCallback(async () => {
    if (!localStream || disableSwitchCamera || disableShutter) {
      return;
    }

    setDisableShutter(true);

    try {
      const track = localStream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const photoBlob = await imageCapture.takePhoto({
        fillLightMode: 'auto', // 'auto' | 'off' | 'flash'
        redEyeReduction: true,
      });

      if (photoBlob) {
        setPhotos((prevPhotos) => prevPhotos.concat(photoBlob));
      }
    } catch (error) {
      notice(`${error}`);
    }

    setDisableShutter(undefined);
  }, [localStream, disableSwitchCamera, disableShutter, notice]);

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

  const switchCamera = useCallback(async () => {
    const nextCameraInfo = await getNextCamera(localStream);

    if (!nextCameraInfo) {
      return;
    }

    try {
      if (localMinStream) {
        stopStream(localMinStream);
      }
      if (localStream) {
        stopStream(localStream);
      }

      const stream = await startStream({
        video: {
          deviceId: nextCameraInfo.deviceId,
        },
      });

      setLocalStream(stream);
    } catch (error) {
      notice(`${error}`);
    }
  }, [localStream, localMinStream, notice]);

  const takePhotoWithMessage = useCallback(async () => {
    sendMessage('#photo');
    await takePhoto();
    sendMessage('#photoed');
  }, [takePhoto, sendMessage]);

  const switchCameraWithMessage = useCallback(async () => {
    sendMessage('#switchcamera');
    await switchCamera();
    sendMessage('#switchedcamera');
  }, [switchCamera, sendMessage]);

  const onMessage = useCallback<OnMessage>(async (message) => {
    logger.log('message', message);

    if (/^#/.test(message)) {
      logger.log('MESSAGE', message.substring(1));
      switch (message.substring(1)) {
        case 'photo':
          setShutterAnimationId(Date.now());
          await takePhotoWithMessage();
          break;

        case 'switchcamera':
          await switchCameraWithMessage();
          break;

        default:
          break;
      }
    }
  }, [switchCameraWithMessage, takePhotoWithMessage]);

  const onCall = useCallback<OnCall>(async (sourceId, answer) => {
    logger.log(`Get call from <${sourceId}>`);

    const acceptCall = await askYesNo(`Accept call from <${sourceId}>?`);

    try {
      if (!acceptCall) {
        logger.log(`Declined call from <${sourceId}>`);
        answer(false);

        throw Error('Declined call');
      }

      if (!localMinStream) {
        throw ReferenceError('Media stream not ready');
      }

      const stream = await answer(true, localMinStream);

      if (!stream) {
        throw ReferenceError('Not receive remote stream');
      }

      logger.log(`Receive remote stream <${sourceId}>`);
      setRemoteStream(stream);
    } catch (error) {
      const errorMessage = `${error}`;

      logger.warn(errorMessage);
      notice(errorMessage);
    }
  }, [askYesNo, localMinStream, notice]);

  const onHangUp: OnHangUp = () => {
    setLocalStream(undefined);
    setLocalMinStream(undefined);
    setRemoteStream(undefined);
  };

  useEffect(() => {
    startStream()
      .then((stream) => {
        setLocalStream(stream);
        setDisableShutter(undefined);
        setDisableSwitchCamera(undefined);
      })
      .catch((error) => {
        notice(`Failed to init stream: ${error}`);
      });
  }, [notice]);

  useEffect(() => {
    if (localStream) {
      setLocalMinStream(minifyCameraStream(localStream));
    } else {
      setLocalMinStream(undefined);
    }
  }, [localStream]);

  useEffect(() => {
    if (localMinStream && peerId && isMediaConnected) {
      call(peerId, localMinStream);
    }
  }, [call, localMinStream, peerId, isMediaConnected]);

  useEffect(() => {
    if (isDataConnected) {
      setOnMessage(onMessage);
    }

    return () => {
      setOnMessage();
    };
  }, [isDataConnected, onMessage, setOnMessage]);

  useEffect(() => {
    if (isDataConnected) {
      setOnCall(onCall);
    }

    return () => {
      setOnCall();
    };
  }, [isDataConnected, onCall, setOnCall]);

  useEffect(() => {
    if (isMediaConnected) {
      setOnHangUp(onHangUp);
    }

    return () => {
      setOnHangUp();
    };
  }, [isMediaConnected, setOnHangUp]);

  useEffect(() => () => {
    if (isOnline) {
      onHangUp();
    }
  }, [isOnline]);

  useEffect(() => {
    setDisableShutter(true);
    setDisableSwitchCamera(true);

    return () => {
      onHangUp();
    };
  }, []);

  return (
    <CameraView
      className={styles.camera}
      disableShutter={disableShutter}
      disableSwitchCamera={disableSwitchCamera}
      shutterAnimationId={shutterAnimationId}
      onShutter={takePhotoWithMessage}
      onSwitchCamera={switchCameraWithMessage}
      majorStream={localStream}
      minorStream={remoteStream}
    >
      <div className={styles.title}>
        <Tag>Camera #{connectionId}</Tag>

        <ShareCamera
          ask
          cameraUrl={cameraUrl}
        />
      </div>

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
