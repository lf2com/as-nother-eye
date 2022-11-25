import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, {
  FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useConnectionContext } from '../../../contexts/ConnectionContext';
import { useModalContext } from '../../../contexts/ModalContext';

import Shutter from '../../../components/CameraShutter';
import Clickable from '../../../components/Clickable';
import Frame from '../../../components/Frame';
import Loading from '../../../components/Loading';
import ShareAndConnectModal from '../../../components/Modal/ShareAndConnectModal';
import Video from '../../../components/Video';

import delayAwaitResult from '../../../utils/delayAwaitResult';
import Logger from '../../../utils/logger';
import EventHandler from '../../../utils/RemoteConnection/event/handler';
import { startStream, stopStream } from '../../../utils/userMedia';
import wait from '../../../utils/wait';

import styles from './styles.module.scss';

interface StreamLocalRemote {
  local?: MediaStream;
  remote?: MediaStream;
}

interface StreamMajorMinor {
  major?: MediaStream;
  minor?: MediaStream;
}

export interface CameraViewProps {
  className?: string;
  targetId?: string;
  logger?: Logger;
  mediaStreamGenerator?: () => Promise<MediaStream>;
  mediaStreamConverter?: (streams: StreamLocalRemote) => StreamMajorMinor;
  showTakePhotoAnimation?: boolean;
  afterTakePhotoAnimation?: () => void;
  shareUrlGenerator: (id: string) => string;
  shareText: string;
  connectText: string;
  askConnectText: string;
  waitingConnectionText: string;
  onShot: (sources: StreamMajorMinor) => void;
  onData: (data: unknown) => void | boolean;
  onCall: (id: string) => void | boolean;
  onHangUp: EventHandler['hangup'];
  disabledSwitchCamera?: boolean;
  onSwitchCamera?: (streams: StreamMajorMinor) => Promise<void>;
}

const CameraView: FunctionComponent<PropsWithChildren<CameraViewProps>> = ({
  className,
  targetId,
  mediaStreamGenerator,
  disabledSwitchCamera,
  onSwitchCamera,
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
  const streamSources = useRef<StreamLocalRemote>({});
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

  const callPeer = useCallback(async (targetPeerId: string) => {
    const {
      local: localStream,
    } = streamSources.current;

    logger.log(`Calling peer <${targetPeerId}>`);
    setLoadingMessage(`Calling to <${targetPeerId}>`);

    try {
      if (!localStream) {
        throw ReferenceError('Local media stream not ready');
      }

      const minStream = getMinLocalStream();

      setMinLocalStream(minStream);
      await connector.connect(targetPeerId);

      const peerStream = await connector.call(targetPeerId, minStream);
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

  const onConnect = useCallback(async (targetPeerId: string) => {
    if (targetPeerId.length === 0) {
      throw ReferenceError('No ID for connection');
    }

    try {
      await callPeer(targetPeerId);
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

  const onPeerCall = useCallback<EventHandler['call']>(async (targetPeerId, answer) => {
    logger.log(`Get call from <${targetPeerId}>`);
    setLoadingMessage(`Get call from <${targetPeerId}>`);

    if (onCall(targetPeerId) === false) {
      logger.log('Ignored call');
      return;
    }

    const acceptPeerCall = await askYesNo(`Accept peer from <${targetPeerId}>?`);

    try {
      if (!acceptPeerCall) {
        logger.log(`Declined call from <${targetPeerId}>`);
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

  const onPeerHangUp = useCallback<EventHandler['hangup']>((targetPeerId) => {
    logger.log('HANGUP');
    setMinorStream(undefined);
    setMajorStream(undefined);
    streamSources.current = {};
    onHangUp(targetPeerId);
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

    // stream.getVideoTracks().forEach((track) => {
    //   const capabilities = track.getCapabilities();
    //   const { width, height } = capabilities;

    //   track.applyConstraints({
    //     width: {
    //       min: width?.max,
    //       ideal: width?.max,
    //     },
    //     height: {
    //       min: height?.max,
    //       ideal: height?.max,
    //     },
    //   });
    // });

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

  const handleSwitchCamera = useCallback(async () => {
    if (onSwitchCamera) {
      await onSwitchCamera({
        major: majorStream,
        minor: minorStream,
      });
    }
  }, [majorStream, minorStream, onSwitchCamera]);

  const onOffline = useCallback<EventHandler['offline']>(() => {
    logger.warn('offline');
    setMajorStream(undefined);
    setMinorStream(undefined);
  }, [logger]);

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
      connector.addEventListener('call', onPeerCall, { once: true });
      connector.addEventListener('data', onPeerData);
    }
    if (isMediaConnected) {
      connector.addEventListener('hangup', onPeerHangUp, { once: true });
      connector.addEventListener('offline', onOffline, { once: true });
    }

    return () => {
      if (isDataConnected) {
        connector.removeEventListener('call', onPeerCall);
        connector.removeEventListener('data', onPeerData);
      }
      if (isMediaConnected) {
        connector.removeEventListener('hangup', onPeerHangUp);
        connector.removeEventListener('offline', onOffline);
      }
    };
  }, [
    connector, isDataConnected, isMediaConnected,
    onPeerData, onPeerCall, onPeerHangUp, onOffline,
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
      {onSwitchCamera && (
        <Clickable
          className={styles['switch-camera']}
          disabled={disabledSwitchCamera}
          onClick={handleSwitchCamera}
        >
          <FontAwesomeIcon icon={faCameraRotate} />
        </Clickable>
      )}

      <Loading>
        {loadingMessage}
      </Loading>
    </Frame>
  );
};

export default CameraView;
