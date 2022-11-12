import classnames from 'classnames';
import React, {
  FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useConnectionContext } from '../../../contexts/ConnectionContext';
import { useModalContext } from '../../../contexts/ModalContext';

import Shutter from '../../../components/CameraShutter';
import Frame from '../../../components/Frame';
import Loading from '../../../components/Loading';
import ShareAndConnectModal from '../../../components/Modal/ShareAndConnectModal';
import Video from '../../../components/Video';

import Logger from '../../../utils/logger';
import EventHandler from '../../../utils/RemoteConnection/event/handler';
import { delayAwaitResult, wait } from '../../../utils/stdlib';
import { startStream, stopStream } from '../../../utils/userMedia';

import styles from './styles.module.scss';

interface MediaStreamInput {
  local?: MediaStream;
  remote?: MediaStream;
}

interface MediaStreamOutput {
  major?: MediaStream;
  minor?: MediaStream;
}

export interface CameraViewProps {
  className?: string;
  targetId?: string;
  logger?: Logger;
  mediaStreamGenerator?: () => Promise<MediaStream>;
  mediaStreamConverter?: (input: MediaStreamInput) => MediaStreamOutput;
  showTakePhotoAnimation?: boolean;
  afterTakePhotoAnimation?: () => void;
  shareUrlGenerator: (id: string) => string;
  shareText: string;
  connectText: string;
  askConnectText: string;
  waitingConnectionText: string;
  onShot: (sources: MediaStreamOutput) => void;
  onData: (data: unknown) => void | boolean;
  onCall: (id: string) => void | boolean;
  onHangUp: EventHandler['hangup'];
}

const CameraView: FunctionComponent<PropsWithChildren<CameraViewProps>> = ({
  className,
  targetId,
  mediaStreamGenerator,
  shareUrlGenerator,
  shareText,
  connectText,
  askConnectText,
  waitingConnectionText,
  onShot,
  onData,
  onCall,
  onHangUp,
  children,
  mediaStreamConverter = ({ local, remote }) => ({
    major: local,
    minor: remote,
  }),
  showTakePhotoAnimation = false,
  afterTakePhotoAnimation,
}) => {
  const { notice, askYesNo } = useModalContext();
  const {
    connector, isOnline, isDataConnected, isMediaConnected, id,
  } = useConnectionContext();
  const logger = useMemo(() => new Logger({
    tag: `[${id}]`,
  }), [id]);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const streamSources = useRef<MediaStreamInput>({});
  const [minorStream, setMinorStream] = useState<MediaStream>();
  const [majorStream, setMajorStream] = useState<MediaStream>();
  const [minLocalStream, setMinLocalStream] = useState<MediaStream>();
  const refMajorVideo = useRef<HTMLVideoElement>(null);
  const shareUrl = useMemo(() => shareUrlGenerator(id), [shareUrlGenerator, id]);

  const createMediaStream = useCallback(async () => (
    mediaStreamGenerator ? mediaStreamGenerator() : startStream()
  ), [mediaStreamGenerator]);

  const getMinLocalStream = useCallback(() => {
    const {
      local: localStream,
    } = streamSources.current;

    if (!localStream) {
      throw ReferenceError('Local media stream not ready');
    }

    const minStream = localStream.clone();

    minStream.getTracks().forEach((track) => {
      const { width, height } = track.getCapabilities();

      track.applyConstraints({
        width: {
          max: Math.round(Number(width?.max ?? 0) / 10),
        },
        height: {
          max: Math.round(Number(height?.max ?? 0) / 10),
        },
        frameRate: 15,
      });
    });

    return minStream;
  }, []);

  const callPeer = useCallback(async (peerId: string) => {
    const {
      local: localStream,
    } = streamSources.current;

    logger.log(`Calling peer <${peerId}>`);
    setLoadingMessage(`Calling to <${peerId}>`);

    try {
      if (!localStream) {
        throw ReferenceError('Local media stream not ready');
      }

      const minStream = getMinLocalStream();

      setMinLocalStream(minStream);
      await connector.connect(peerId);

      const peerStream = await connector.call(peerId, minStream);
      const { major, minor } = mediaStreamConverter({
        local: streamSources.current.local,
        remote: peerStream,
      });

      logger.log('Connected');
      setLoadingMessage('Connected');
      streamSources.current.remote = peerStream;
      setMajorStream(major);
      setMinorStream(minor);
    } finally {
      setLoadingMessage(undefined);
    }
  }, [logger, getMinLocalStream, connector, mediaStreamConverter]);

  const onConnect = useCallback(async (peerId: string) => {
    if (peerId.length === 0) {
      throw ReferenceError('No ID for connection');
    }

    try {
      await callPeer(peerId);
    } catch (error) {
      logger.warn(`${error}`);
      notice(`${error}`);
    }
  }, [callPeer, logger, notice]);

  const onPeerData = useCallback<EventHandler['data']>((_, data) => {
    if (onData(data) === false) {
      logger.log('Ignored data');
      return;
    }

    logger.log('DATA', data);
  }, [logger, onData]);

  const onPeerCall = useCallback<EventHandler['call']>(async (peerId, answer) => {
    logger.log(`Get call from <${peerId}>`);
    setLoadingMessage(`Get call from <${peerId}>`);

    if (onCall(peerId) === false) {
      logger.log('Ignored call');
      return;
    }

    const acceptPeerCall = await askYesNo(`Accept camera from <${peerId}>?`);

    try {
      if (!acceptPeerCall) {
        logger.log(`Declined call from <${peerId}>`);
        notice('Declined call');
        answer(false);

        throw Error('Declined call');
      }

      const minStream = getMinLocalStream();

      setMinLocalStream(minStream);

      const peerStream = await answer(true, minStream);

      logger.log('Received remote media stream', peerStream);
      setLoadingMessage('Received');

      if (!peerStream) {
        throw ReferenceError('Not receive remote media stream');
      }

      const { major, minor } = mediaStreamConverter({
        local: streamSources.current.local,
        remote: peerStream,
      });

      streamSources.current.remote = peerStream;
      setMajorStream(major);
      setMinorStream(minor);
    } catch (error) {
      logger.warn(`${error}`);
      notice(`${error}`);
    } finally {
      setLoadingMessage(undefined);
    }
  }, [askYesNo, getMinLocalStream, logger, mediaStreamConverter, notice, onCall]);

  const onPeerHangUp = useCallback<EventHandler['hangup']>((peerId) => {
    logger.log('HANGUP');
    setMinorStream(undefined);
    setMajorStream(undefined);
    streamSources.current = {};
    onHangUp(peerId);
  }, [logger, onHangUp]);

  const handleShot = useCallback(() => {
    onShot({
      major: majorStream,
      minor: minorStream,
    });
  }, [minorStream, onShot, majorStream]);

  const hanleMajorAnimationEnd = useCallback(() => {
    if (showTakePhotoAnimation) {
      afterTakePhotoAnimation?.();
    }
  }, [afterTakePhotoAnimation, showTakePhotoAnimation]);

  const initConnector = useCallback(async () => {
    const connectTarget = targetId ? `<${targetId}>` : 'server';

    logger.log(`Connecting to ${connectTarget}`);
    setLoadingMessage(`Connecting to ${connectTarget}`);
    await delayAwaitResult(connector.connect(), 500);
    logger.log(`Connected to ${connectTarget}`);
    setLoadingMessage('Connected');
    await wait(500);
    logger.log('Initializing local media stream');
    setLoadingMessage('Initializing camera');

    const stream = await createMediaStream();
    const { major, minor } = mediaStreamConverter({
      local: stream,
    });

    logger.log('Initialized local media stream');
    setLoadingMessage('Initialized');
    streamSources.current.local = stream;
    setMajorStream(major);
    setMinorStream(minor);

    if (targetId) {
      await wait(500);
      await callPeer(targetId);
    }

    await wait(0);
    setLoadingMessage(undefined);
  }, [callPeer, connector, createMediaStream, logger, mediaStreamConverter, targetId]);

  useEffect(() => {
    try {
      initConnector();
    } catch (error) {
      logger.warn(`${error}`);
      notice(`${error}`);
    }
  }, [initConnector, logger, notice]);

  useEffect(() => {
    if (isDataConnected) {
      connector.addEventListener('call', onPeerCall);
      connector.addEventListener('data', onPeerData);
    }
    if (isMediaConnected) {
      connector.addEventListener('hangup', onPeerHangUp);
    }

    return () => {
      if (isDataConnected) {
        connector.removeEventListener('call', onPeerCall);
        connector.removeEventListener('data', onPeerData);
      }
      if (isMediaConnected) {
        connector.removeEventListener('hangup', onPeerHangUp);
      }
    };
  }, [
    connector, isDataConnected, isMediaConnected,
    onPeerData, onPeerCall, onPeerHangUp,
  ]);

  useEffect(() => (
    () => {
      if (minLocalStream) {
        stopStream(minLocalStream);
      }
    }
  ), [minLocalStream]);

  useEffect(() => (
    () => {
      if (minorStream) {
        stopStream(minorStream);
        setMinLocalStream(undefined);
      }
    }
  ), [minorStream]);

  useEffect(() => (
    () => {
      if (majorStream) {
        stopStream(majorStream);
      }
    }
  ), [majorStream]);

  useEffect(() => {
    const video = refMajorVideo.current;

    if (video) {
      if (showTakePhotoAnimation) {
        video.pause();
      } else {
        video.play();
      }
    }
  }, [showTakePhotoAnimation]);

  return (
    <Frame className={classnames(styles['camera-view'], className)}>
      {children}

      <ShareAndConnectModal
        show={!isMediaConnected}
        shareUrl={shareUrl}
        onConnect={onConnect}
        shareText={shareText}
        connectText={connectText}
        askConnectText={askConnectText}
      >
        {waitingConnectionText}
      </ShareAndConnectModal>

      <Frame
        className={classnames(styles.major, {
          [styles['taking-photo']]: showTakePhotoAnimation,
        })}
        onAnimationEnd={hanleMajorAnimationEnd}
      >
        <Video
          ref={refMajorVideo}
          srcObject={majorStream}
        />
      </Frame>
      <Video
        className={styles.minor}
        srcObject={minorStream}
      />
      <Shutter
        className={styles.shutter}
        disabled={!isOnline}
        onShot={handleShot}
      />

      <Loading>
        {loadingMessage}
      </Loading>
    </Frame>
  );
};

export default CameraView;
