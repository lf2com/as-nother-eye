import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
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

interface PhotoerProps {
}

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const params = useParams();
  const { askYesNo, notice } = useModalContext();
  const { targetId } = params;
  const { connector, isOnline } = useConnectionContext();
  const [cameraId, setCameraId] = useState<string>();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localConnStream, setLocalConnStream] = useState<MediaStream>();
  const [photos, setPhotos] = useState<Blob[]>([]);

  const showSharePhotoer = useMemo(() => !cameraId, [cameraId]);
  const [showCameraIdModal, setShowCameraIdModal] = useState(false);
  const hideCameraIdModal = useCallback(() => setShowCameraIdModal(false), []);

  const shareCameraUrl = useMemo(() => (
    new URL(`/camera/${connector.id}`, globalThis.location.href).toString()
  ), [connector.id]);

  const onPhoto = useCallback(() => {
    connector.sendMessage(cameraId!, '#photo');
  }, [connector, cameraId]);

  const onGetData = useCallback<EventHandler['data']>((_, data) => {
    logger.log('DATA', data);

    const blob = new Blob([data as ArrayBuffer]);

    setPhotos((prevPhotos) => [...prevPhotos, blob]);
  }, []);

  const onCall = useCallback<EventHandler['call']>(async (sourceId, answer) => {
    setShowLoading(true);
    logger.log(`Get call from <${sourceId}>`);
    setLoadingMessage(`Get call from <${sourceId}>`);

    const acceptPeerCall = await askYesNo(`Accept camera from <${sourceId}>?`);

    try {
      if (!acceptPeerCall) {
        logger.log(`Declined call from <${sourceId}>`);
        setLoadingMessage('Declined call');
        answer(false);

        throw Error('Declined call');
      }

      const peerStream = await answer(true, localConnStream) as MediaStream;

      logger.log('Received remote media stream', peerStream);
      setLoadingMessage('Received');
      setRemoteStream(peerStream);
      setCameraId(sourceId);
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

  const callCamera = useCallback(async (id: string, stream: MediaStream) => {
    setShowLoading(true);
    logger.log(`Calling peer <${id}>`);
    setLoadingMessage(`Calling to <${id}>`);

    try {
      const peerStream = await connector.call(id, stream);

      logger.log('Connected');
      setLoadingMessage('Connected');
      setRemoteStream(peerStream);
      setCameraId(id);
    } catch (error) {
      logger.warn(`${error}`);
      setLoadingMessage(`${error}`);
    }
  }, [connector]);

  const onClickCallCameraButton = useCallback(() => {
    setShowCameraIdModal(true);
  }, []);

  const onConfirmCameraId = useCallback<Parameters<typeof AskInputModal>[0]['onConfirm']>((id) => {
    if (id.length > 0) {
      callCamera(id, localConnStream!);
    }
  }, [callCamera, localConnStream]);

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
          facingMode: 'environment',
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
        await callCamera(targetId, selfConnStream);
      }
    } catch (error) {
      logger.log(100, error);
      notice(`${error}`);
    }

    setShowLoading(false);
  }, [callCamera, connector, notice, targetId]);

  useEffect(() => {
    initConnector();
  }, [initConnector]);

  useEffect(() => {
    if (isOnline && remoteStream) {
      connector.addEventListener('call', onCall);
      connector.addEventListener('data', onGetData);
      connector.addEventListener('hangup', onHangUp);
    }

    return () => {
      connector.removeEventListener('call', onCall);
      connector.removeEventListener('data', onGetData);
      connector.removeEventListener('hangup', onHangUp);
    };
  }, [connector, isOnline, localStream, onCall, onGetData, onHangUp, remoteStream]);

  useEffect(() => (
    () => {
      if (localStream) {
        stopStream(localStream);
      }
    }
  ), [localStream]);

  useEffect(() => {
    logger.log('PHOTOS', photos);
  }, [photos]);

  return (
    <Frame className={styles.photoer}>
      <Tag>Photoer #{connector.id}</Tag>

      <ShareAndConnectModal
        show={showSharePhotoer}
        shareUrl={shareCameraUrl}
        onClickConnect={onClickCallCameraButton}
        shareText="Share Photoer"
        connectText="Connect Camera"
      >
        Waiting for camera to connect
      </ShareAndConnectModal>

      <AskInputModal
        show={showCameraIdModal}
        onCancel={hideCameraIdModal}
        onConfirm={onConfirmCameraId}
      >
        Connect to camera
      </AskInputModal>

      <Frame className={styles.major}>
        <Video srcObject={remoteStream} />
      </Frame>

      <Video
        className={styles.minor}
        srcObject={localStream}
      />
      <Shutter
        className={styles.shutter}
        disabled={!isOnline}
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

export default Photoer;
