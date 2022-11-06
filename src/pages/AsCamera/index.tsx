import classnames from 'classnames';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import AskInputModal from '../../components/Modal/AskInputModal';
import ShareAndConnectModal from '../../components/Modal/ShareAndConnectModal';
import PhotoList from '../../components/PhotoList';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import Logger from '../../utils/logger';
import EventHandler from '../../utils/RemoteConnection/event/handler';
import { delayAwaitResult, wait } from '../../utils/stdlib';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Camera]' });

const Camera = () => {
  const params = useParams();
  const { askYesNo, notice } = useModalContext();
  const { targetId } = params;
  const { connector, isOnline } = useConnectionContext();
  const majorVideoRef = useRef<HTMLVideoElement>(null);
  const [photoerId, setPhotoerId] = useState<string>();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localConnStream, setLocalConnStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [handlingPhoto, setHandlingPhoto] = useState<boolean>(false);
  const [lastPhoto, setLastPhoto] = useState<Blob>();
  const [photos, setPhotos] = useState<Blob[]>([]);

  const showShareCamera = useMemo(() => !photoerId, [photoerId]);
  const [showPhotoerIdModal, setShowPhotoerIdModal] = useState(false);
  const hidePhotoerIdModal = useCallback(() => setShowPhotoerIdModal(false), []);

  const shareCameraUrl = useMemo(() => (
    new URL(`/photoer/${connector.id}`, globalThis.location.href).toString()
  ), [connector.id]);

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
    setPhotos((prevPhotos) => prevPhotos.concat(photoBlob));
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
    setShowLoading(true);
    logger.log(`Get call from <${sourceId}>`);
    setLoadingMessage(`Get call from <${sourceId}>`);

    const acceptPeerCall = await askYesNo(`Accept photoer from <${sourceId}>?`);

    logger.warn('accept result: ', acceptPeerCall);
    try {
      if (!acceptPeerCall) {
        logger.log(`Declined call from <${sourceId}>`);
        setLoadingMessage('Declined call');
        answer(false);

        throw Error('Declined call');
      }

      setLoadingMessage('Receiving peer camera');

      const peerStream = await answer(true, localConnStream) as MediaStream;

      logger.log('Received remote media stream', peerStream);
      setLoadingMessage('Received');
      setRemoteStream(peerStream);
      setPhotoerId(sourceId);
    } catch (error) {
      logger.warn(`${error}`);
      setLoadingMessage(`${error}`);
    }

    setShowLoading(false);
  }, [askYesNo, localConnStream]);

  const onHangUp = useCallback<EventHandler['hangup']>(() => {
    logger.log('Closed');
    if (localStream) {
      stopStream(localStream);
    }
  }, [localStream]);

  const callPhotoer = useCallback(async (id: string, stream: MediaStream) => {
    setShowLoading(true);
    logger.log(`Calling peer <${id}>`);
    setLoadingMessage(`Calling to <${id}>`);

    const peerStream = await connector.call(id, stream);

    logger.log('Connected');
    setLoadingMessage('Connected');
    setRemoteStream(peerStream);
    setPhotoerId(id);
  }, [connector]);

  const onClickCallPhotoerButton = useCallback(() => {
    setShowPhotoerIdModal(true);
  }, []);

  const onConfirmPhotoerId = useCallback<Parameters<typeof AskInputModal>[0]['onConfirm']>((id) => {
    if (id.length > 0) {
      callPhotoer(id, localConnStream!);
    }
  }, [callPhotoer, localConnStream]);

  const initConnector = useCallback(async () => {
    setShowLoading(true);

    try {
      if (!connector.isOnline || targetId) {
        const connectTarget = targetId ? `<${targetId}>` : 'server';

        logger.log(`Connecting to ${connectTarget}`);
        setLoadingMessage(`Connecting to ${connectTarget}`);
        await delayAwaitResult(connector.connect(targetId), 1000);
        logger.log(`Connected to ${connectTarget}`);
        setLoadingMessage('Connected');
        await wait(1000);
      }

      logger.log('Initializing local media stream');
      setLoadingMessage('Initializing camera');

      const selfStream = await startStream({
        video: {
          facingMode: 'user',
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
      logger.log('Initialized local media stream', selfStream);
      setLoadingMessage('Initialized');
      setLocalStream(selfStream);
      setLocalConnStream(selfConnStream);

      if (targetId) {
        await wait(1000);
        await callPhotoer(targetId, selfConnStream);
      }
    } catch (error) {
      logger.log(100, error);
      notice(`${error}`);
    }

    setShowLoading(false);
  }, [callPhotoer, connector, notice, targetId]);

  useEffect(() => {
    initConnector();
  }, [initConnector]);

  useEffect(() => {
    if (isOnline) {
      connector.addEventListener('call', onCall);
      connector.addEventListener('data', onGetData);
      connector.addEventListener('hangup', onHangUp);
    }

    return () => {
      connector.removeEventListener('call', onCall);
      connector.removeEventListener('data', onGetData);
      connector.removeEventListener('hangup', onHangUp);
    };
  }, [isOnline, localStream, connector, onCall, onGetData, onHangUp]);

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

  // useEffect(() => {
  //   if (photoerId && lastPhoto) {
  //     remoteConnection.sendFile(photoerId, lastPhoto);
  //   }
  // }, [lastPhoto, photoerId, remoteConnection]);

  logger.log({
    localStream, remoteStream, takingPhoto, handlingPhoto, holdMajorVideo,
  });

  return (
    <Frame className={styles.camera}>
      <Tag>Camera #{connector.id}</Tag>

      <ShareAndConnectModal
        show={showShareCamera}
        shareUrl={shareCameraUrl}
        onClickConnect={onClickCallPhotoerButton}
        shareText="Share Camera"
        connectText="Connect Photoer"
      >
        Waiting for photoer to connect
      </ShareAndConnectModal>

      <AskInputModal
        show={showPhotoerIdModal}
        onCancel={hidePhotoerIdModal}
        onConfirm={onConfirmPhotoerId}
      >
        Connect to photoer
      </AskInputModal>

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
      <PhotoList
        className={styles['photo-list']}
        photos={photos}
        size={5}
      />

      <Loading show={showLoading}>
        {loadingMessage}
      </Loading>
    </Frame>
  );
};

export default Camera;
