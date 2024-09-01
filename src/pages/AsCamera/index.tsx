import type { FC } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { CameraViewProps } from '@/components/CameraView';
import CameraView from '@/components/CameraView';
import type { PhotoManagementProps } from '@/components/PhotoManagement';
import PhotoManagement from '@/components/PhotoManagement';
import Tag from '@/components/Tag';
import Video from '@/components/Video';
import type { OnCall, OnCommand, OnHangUp } from '@/contexts/ConnectionContext';
import { useConnectionContext } from '@/contexts/ConnectionContext';
import type { FlipCameraCommand } from '@/contexts/ConnectionContext/Command';
import { CommandType } from '@/contexts/ConnectionContext/Command';
import { useModalContext } from '@/contexts/ModalContext';
import createRoutePath from '@/utils/createRoutePath';
import { downloadFiles } from '@/utils/downloadFile';
import Logger from '@/utils/logger';
import shareData from '@/utils/shareData';
import {
  getNextCamera,
  minifyCameraStream,
  startStream,
  stopStream,
} from '@/utils/userMedia';

const logger = new Logger({ tag: '[Camera]' });

const Camera: FC = () => {
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
  const [disableFlipCamera, setDisableFlipCamera] = useState<boolean>();
  const [shutterAnimationId, setShutterAnimationId] = useState<number>();
  const [localRawStream, setLocalRawStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localMinStream, setLocalMinStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const cameraUrl = useMemo(
    () => createRoutePath(`/photoer/${connectionId}`),
    [connectionId]
  );
  const flipCameraRef = useRef<FlipCameraCommand['param'][]>([]);
  const localRawVideoRef = useRef<HTMLVideoElement>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawLocalCanvasAnimationId = useRef<number>();

  const takePhoto = useCallback(async () => {
    if (!localRawStream || disableSwitchCamera || disableShutter) {
      return;
    }

    setDisableShutter(true);

    try {
      const track = localRawStream.getTracks()[0];

      if (!track) {
        throw ReferenceError('No camera track');
      }

      const imageCapture = new ImageCapture(track);
      const blob = await imageCapture.takePhoto({
        redEyeReduction: true,
      });
      const photoBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.addEventListener('load', () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw Error('Failed to get canvas context');
          }

          const flipOptions = flipCameraRef.current;
          const { naturalWidth: width, naturalHeight: height } = img;

          canvas.width = width;
          canvas.height = height;

          if (flipOptions.includes('horizontal')) {
            context.transform(-1, 0, 0, 1, width, 0);
          }
          if (flipOptions.includes('vertical')) {
            context.transform(1, 0, 0, -1, 0, height);
          }

          context.drawImage(img, 0, 0, width, height);
          canvas.toBlob(bitmapBlob => {
            if (bitmapBlob) {
              resolve(bitmapBlob);
            } else {
              reject(Error('Failed to convert camera frame'));
            }
          });
        });

        img.addEventListener('error', error => {
          reject(error);
        });

        img.src = url;
      });

      if (!photoBlob) {
        throw ReferenceError('No photo blob');
      }

      const url = URL.createObjectURL(photoBlob);

      setPhotos(prevPhotos => prevPhotos.concat(photoBlob));
      URL.revokeObjectURL(url);
    } catch (error) {
      notice(`${error}`);
    }

    setDisableShutter(undefined);
  }, [localRawStream, disableSwitchCamera, disableShutter, notice]);

  const onSaveSelectedPhotos = useCallback<PhotoManagementProps['onSave']>(
    selectedPhotos => {
      downloadFiles(selectedPhotos);
    },
    []
  );

  const onShareSelectedPhotos = useCallback<PhotoManagementProps['onShare']>(
    async selectedPhotos => {
      try {
        await shareData({
          files: selectedPhotos,
        });
      } catch (error) {
        notice(`${error}`);
      }
    },
    [notice]
  );

  const switchCamera = useCallback(async () => {
    const nextCameraInfo = await getNextCamera(localRawStream);

    if (!nextCameraInfo) {
      return;
    }

    try {
      if (localMinStream) {
        stopStream(localMinStream);
      }
      if (localRawStream) {
        stopStream(localRawStream);
      }

      const stream = await startStream({
        video: {
          deviceId: nextCameraInfo.deviceId,
        },
      });

      setLocalRawStream(stream);
    } catch (error) {
      notice(`${error}`);
    }
  }, [localRawStream, localMinStream, notice]);

  const takePhotoWithMessage = useCallback(async () => {
    try {
      await sendCommand(CommandType.takingPhoto, true, true);
      await takePhoto();
      await sendCommand(CommandType.takingPhoto, false, true);
    } catch (error) {
      notice(`${error}`);
    }
  }, [sendCommand, takePhoto, notice]);

  const switchCameraWithMessage = useCallback(async () => {
    try {
      await sendCommand(CommandType.switchingCamera, true, true);
      await switchCamera();
      await sendCommand(CommandType.switchingCamera, false, true);
    } catch (error) {
      notice(`${error}`);
    }
  }, [sendCommand, switchCamera, notice]);

  const flipCameraWithMessage = useCallback<CameraViewProps['onFlipCamera']>(
    async direction => {
      try {
        const flipOptions = flipCameraRef.current;
        const indexOfDirection = flipOptions.indexOf(direction);

        await sendCommand(CommandType.flippingCamera, true, true);

        if (indexOfDirection === -1) {
          flipCameraRef.current = [...flipOptions, direction];
        } else {
          flipCameraRef.current = [
            ...flipOptions.slice(0, indexOfDirection),
            ...flipOptions.slice(indexOfDirection + 1),
          ];
        }

        await sendCommand(CommandType.flippingCamera, false, true);
      } catch (error) {
        notice(`${error}`);
      }
    },
    [notice, sendCommand]
  );

  const onCommand = useCallback<OnCommand>(
    async (type, command) => {
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
          await flipCameraWithMessage(command as FlipCameraCommand['param']);
          break;

        default:
          break;
      }
    },
    [switchCameraWithMessage, takePhotoWithMessage, flipCameraWithMessage]
  );

  const onCall = useCallback<OnCall>(
    async (sourceId, answer) => {
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
    },
    [askYesNo, localMinStream, notice]
  );

  const onHangUp: OnHangUp = () => {
    setLocalRawStream(undefined);
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

  const onLoadedRawVideoData = () => {
    const canvas = localCanvasRef.current!;
    const video = localRawVideoRef.current!;
    const context = canvas.getContext('2d');
    const { videoWidth, videoHeight } = video;
    const canvasStream = canvas.captureStream();
    const drawNextFrame = () => {
      if (context) {
        const flipOptions = flipCameraRef.current;

        context.save();

        if (flipOptions.includes('horizontal')) {
          context.transform(-1, 0, 0, 1, videoWidth, 0);
        }
        if (flipOptions.includes('vertical')) {
          context.transform(1, 0, 0, -1, 0, videoHeight);
        }

        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        context.restore();
      }

      drawLocalCanvasAnimationId.current = requestAnimationFrame(drawNextFrame);
    };

    if (drawLocalCanvasAnimationId.current) {
      cancelAnimationFrame(drawLocalCanvasAnimationId.current);
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    video.play();
    drawNextFrame();
    setLocalStream(new MediaStream(canvasStream));
  };

  useEffect(() => {
    startStream()
      .then(stream => {
        setLocalRawStream(stream);
        setDisableShutter(undefined);
        setDisableSwitchCamera(undefined);
        setDisableFlipCamera(undefined);
      })
      .catch(error => {
        notice(`Failed to init stream: ${error}`);
      });
  }, [notice]);

  useEffect(() => {
    if (localRawStream) {
      const defaultFlip = localRawStream.getVideoTracks().some(track => {
        const facingModes = track.getCapabilities().facingMode;

        return !!facingModes?.includes('user');
      });

      flipCameraRef.current = [];

      if (defaultFlip) {
        flipCameraWithMessage('horizontal');
      }
    }
  }, [localRawStream, flipCameraWithMessage]);

  useEffect(() => {
    if (localStream) {
      setLocalMinStream(minifyCameraStream(localStream));
    }

    return () => setLocalMinStream(undefined);
  }, [localStream]);

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

  useEffect(
    () => () => {
      if (isOnline) {
        onHangUp();
      }
    },
    [isOnline]
  );

  useEffect(() => {
    setDisableShutter(true);
    setDisableSwitchCamera(true);
    setDisableFlipCamera(true);

    return () => {
      onHangUp();
    };
  }, []);

  return (
    <CameraView
      disableShutter={disableShutter}
      disableSwitchCamera={disableSwitchCamera}
      disableFlipCamera={disableFlipCamera}
      shutterAnimationId={shutterAnimationId}
      onShutter={takePhotoWithMessage}
      onSwitchCamera={switchCameraWithMessage}
      onFlipCamera={flipCameraWithMessage}
      majorContent={localStream}
      minorContent={remoteStream ?? 'Share Camera'}
      onClickMinor={remoteStream ? undefined : shareCamera}
    >
      <div className="absolute top-0 left-0 m-[0.25em] flex items-center z-[1]">
        <Tag>Camera #{connectionId}</Tag>
      </div>

      <div className="absolute opacity-0 pointer-events-none">
        <Video
          ref={localRawVideoRef}
          srcObject={localRawStream}
          onLoadedData={onLoadedRawVideoData}
        />
        <canvas
          ref={localCanvasRef}
          width={localRawVideoRef.current?.width}
          height={localRawVideoRef.current?.height}
        />
      </div>

      <PhotoManagement
        className="absolute top-[7.5%] right-0 m-[0.5em] w-[30%]"
        photos={photos}
        onShare={onShareSelectedPhotos}
        onSave={onSaveSelectedPhotos}
      />
    </CameraView>
  );
};

export default Camera;
