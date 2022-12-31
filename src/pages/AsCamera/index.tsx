import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';

import {
  OnCall, OnCommand, OnHangUp, useConnectionContext,
} from '@/contexts/ConnectionContext';
import { CommandType } from '@/contexts/ConnectionContext/Command';
import { useModalContext } from '@/contexts/ModalContext';

import CameraView from '@/components/CameraView';
import Clickable from '@/components/Clickable';
import PhotoManagement, { PhotoManagementProps } from '@/components/PhotoManagement';
import Tag from '@/components/Tag';

import createRoutePath from '@/utils/createRoutePath';
import { downloadFiles } from '@/utils/downloadFile';
import Logger from '@/utils/logger';
import shareData from '@/utils/shareData';
import {
  getNextCamera, minifyCameraStream, startStream, stopStream,
} from '@/utils/userMedia';

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
    sendCommand,
    setOnCommand,
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
  const [mirrorCamera, setMirrorCamera] = useState(false);
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

      if (!photoBlob) {
        throw ReferenceError('No photo blob');
      }

      const url = URL.createObjectURL(photoBlob);

      try {
        const finalPhotoBlob = await new Promise<Blob>((resolve, reject) => {
          if (!mirrorCamera) {
            resolve(photoBlob);

            return;
          }

          const img = new Image();

          img.addEventListener('error', reject);

          img.addEventListener('load', () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
              reject(Error('Failed to get context 2D'));

              return;
            }

            const {
              naturalWidth: width,
              naturalHeight: height,
            } = img;

            canvas.width = width;
            canvas.height = height;
            context.setTransform(-1, 0, 0, 1, width, 0);
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(Error('Failed to convert canvas'));
              }
            });
          });

          img.src = url;
        });

        setPhotos((prevPhotos) => prevPhotos.concat(finalPhotoBlob));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      notice(`${error}`);
    }

    setDisableShutter(undefined);
  }, [localStream, disableSwitchCamera, disableShutter, mirrorCamera, notice]);

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
    try {
      await sendCommand(CommandType.takingPhoto, true);
      await takePhoto();
      await sendCommand(CommandType.takingPhoto, false);
    } catch (error) {
      notice(`${error}`);
    }
  }, [sendCommand, takePhoto, notice]);

  const switchCameraWithMessage = useCallback(async () => {
    try {
      await sendCommand(CommandType.switchingCamera, true);
      await switchCamera();
      await sendCommand(CommandType.switchingCamera, false);
    } catch (error) {
      notice(`${error}`);
    }
  }, [sendCommand, switchCamera, notice]);

  const mirrorCameraWithMessage = useCallback(async (mirror: boolean) => {
    try {
      await sendCommand(CommandType.flippingCamera, true);
      setMirrorCamera(mirror);
      await sendCommand(CommandType.flippingCamera, false);
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice, sendCommand]);

  const toggleMirroCamera = useCallback(() => {
    mirrorCameraWithMessage(!mirrorCamera);
  }, [mirrorCamera, mirrorCameraWithMessage]);

  const onCommand = useCallback<OnCommand>(async (type, command) => {
    logger.log('command', type, command);

    switch (type) {
      case CommandType.takePhoto:
        setShutterAnimationId(Date.now());
        await takePhotoWithMessage();
        break;

      case CommandType.switchCamera:
        await switchCameraWithMessage();
        break;

      case CommandType.flipCamera:
        await mirrorCameraWithMessage(!mirrorCamera);
        break;

      default:
        break;
    }
  }, [mirrorCamera, mirrorCameraWithMessage, switchCameraWithMessage, takePhotoWithMessage]);

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
      mirrorCameraWithMessage(mirrorCamera);
    } catch (error) {
      const errorMessage = `${error}`;

      logger.warn(errorMessage);
      notice(errorMessage);
    }
  }, [askYesNo, localMinStream, mirrorCamera, mirrorCameraWithMessage, notice]);

  const onHangUp: OnHangUp = () => {
    setLocalStream(undefined);
    setLocalMinStream(undefined);
    setRemoteStream(undefined);
  };

  const shareCamera = useCallback(async () => {
    const share = await askYesNo('Share camera link?');

    if (share) {
      shareData({
        url: cameraUrl,
      });
    }
  }, [askYesNo, cameraUrl]);

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
      const defultMirror = localStream.getVideoTracks().some((track) => {
        const facingModes = track.getCapabilities().facingMode;

        return !!facingModes?.includes('user');
      });

      mirrorCameraWithMessage(defultMirror);
      setLocalMinStream(minifyCameraStream(localStream));
    } else {
      setLocalMinStream(undefined);
    }
  }, [localStream, mirrorCameraWithMessage]);

  useEffect(() => {
    if (localMinStream && peerId && isMediaConnected) {
      call(peerId, localMinStream);
    }
  }, [call, localMinStream, peerId, isMediaConnected]);

  useEffect(() => {
    if (isDataConnected) {
      setOnCommand(onCommand);
    }

    return () => {
      setOnCommand();
    };
  }, [isDataConnected, onCommand, setOnCommand]);

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
      majorClassName={classnames({
        [styles.mirror]: mirrorCamera,
      })}
      disableShutter={disableShutter}
      disableSwitchCamera={disableSwitchCamera}
      shutterAnimationId={shutterAnimationId}
      onShutter={takePhotoWithMessage}
      onSwitchCamera={switchCameraWithMessage}
      majorContent={localStream}
      minorContent={remoteStream ?? 'Share Camera'}
      onClickMinor={remoteStream ? undefined : shareCamera}
    >
      <div className={styles.title}>
        <Tag>Camera #{connectionId}</Tag>
      </div>

      <Clickable
        className={styles['mirror-button']}
        onClick={toggleMirroCamera}
      >
        <FontAwesomeIcon icon={faArrowsLeftRight} />
      </Clickable>

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
