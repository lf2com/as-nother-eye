import classnames from 'classnames';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useModalContext } from '../../contexts/ModalContext';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import Logger from '../../utils/logger';
import RemoteConnection from '../../utils/RemoteConnection';
import EventHandler from '../../utils/RemoteConnection/event/handler';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Camera]' });

const Camera = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') as string;
  const remoteConnection = useMemo(() => new RemoteConnection(id), [id]);
  const { askYesNo } = useModalContext();
  const majorVideoRef = useRef<HTMLVideoElement>(null);
  const [photoerId, setPhotoerId] = useState<string>();
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localConnStream, setLocalConnStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [handlingPhoto, setHandlingPhoto] = useState<boolean>(false);
  const [lastPhoto, setLastPhoto] = useState<Blob>();

  logger.log('id', id);

  const majorClassName = useMemo(() => classnames(styles.major, {
    [styles['taking-photo']]: takingPhoto,
  }), [takingPhoto]);

  const holdMajorVideo = useMemo(() => (
    takingPhoto || handlingPhoto
  ), [handlingPhoto, takingPhoto]);

  const takePhoto = useCallback(async () => {
    const track = localStream?.getVideoTracks()[0];
    console.log('TRACK', track);

    if (!track) {
      return;
    }

    setHandlingPhoto(true);
    setTakingPhoto(true);

    const imageCapture = new ImageCapture(track);
    const photoBlob = await imageCapture.takePhoto();

    setHandlingPhoto(false);
    setLastPhoto(photoBlob);
  }, [localStream]);

  const onPhoto = takePhoto;

  const afterTakingPhoto = useCallback(() => {
    setTakingPhoto(false);
  }, []);

  const onGetData = useCallback<EventHandler['data']>((_, data) => {
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

  const onCall = useCallback<EventHandler['call']>(async (sourceId, answer) => {
    logger.log(`Get call from <${sourceId}>`);

    const acceptPeerCall = await askYesNo(`Accept photoer from <${sourceId}>?`);

    if (!acceptPeerCall) {
      setLoadingMessage(undefined);
      answer(false);
      return;
    }

    try {
      const selfStream = await startStream({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      const selfConnStream = selfStream.clone();

      selfConnStream.getTracks().forEach((track) => {
        track.applyConstraints({
          width: { ideal: 160 },
          height: { ideal: 120 },
          frameRate: 15,
        });
      });

      logger.log('My stream ready', selfStream);
      setLocalStream(selfStream);
      setLocalConnStream(selfConnStream);

      const peerStream = await answer(true, selfConnStream) as MediaStream;

      logger.log('Remote stream', peerStream);
      setLoadingMessage(`Got call from <${sourceId}>`);
      setRemoteStream(peerStream);
      setPhotoerId(sourceId);
      setLoadingMessage(undefined);
    } catch (error) {
      logger.warn(error);
    }
  }, [askYesNo]);

  useEffect(() => {
    logger.log('Initializing');
    setLoadingMessage('Initializing');
    remoteConnection.connect()
      .then(() => {
        logger.log('Connected to server');
        setLoadingMessage('Connected to server');

        remoteConnection.addEventListener('call', onCall);
        remoteConnection.addEventListener('data', onGetData);
      })
      .catch((error) => {
        logger.warn('Failed to init remote connection', error);
      });

    return () => {
      remoteConnection.removeEventListener('call', onCall);
      remoteConnection.removeEventListener('data', onGetData);
    };
  }, [onCall, onGetData, remoteConnection]);

  useEffect(() => (
    () => {
      if (localStream) {
        stopStream(localStream);
      }
    }
  ), [localStream]);

  useEffect(() => {
    const majorVideo = majorVideoRef.current;

    if (majorVideo) {
      if (holdMajorVideo) {
        majorVideo.pause();
      } else {
        majorVideo.play();
      }
    }
  }, [holdMajorVideo]);

  useEffect(() => {
    if (photoerId && lastPhoto) {
      remoteConnection.sendFile(photoerId, lastPhoto);
    }
  }, [lastPhoto, photoerId, remoteConnection]);

  logger.log({
    localStream, remoteStream, takingPhoto, handlingPhoto, holdMajorVideo,
  });

  return (
    <Frame className={styles.camera}>
      <Tag>Camera #{id}</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
      <Frame
        className={majorClassName}
        onAnimationEnd={afterTakingPhoto}
      >
        <Video
          ref={majorVideoRef}
          srcObject={localStream}
        />
      </Frame>
      <Video
        className={styles.minor}
        srcObject={remoteStream}
      />
      <Shutter
        disabled={holdMajorVideo}
        className={styles.shutter}
        onShot={onPhoto}
      />
    </Frame>
  );
};

export default Camera;
