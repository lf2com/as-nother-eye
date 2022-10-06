import { DataConnection, MediaConnection } from 'peerjs';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

// import { useLoggerContext } from '../../contexts/LoggerContext';
import useLogger from '../../contexts/LoggerContext/hooks/useLogger';

import CameraView from '../../components/CameraView';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Tag from '../../components/Tag';

import useCamera from '../../hooks/useCamera';
import usePeer from '../../hooks/usePeer';

const Camera = () => {
  // const { logger } = useLoggerContext();
  const logger = useLogger({ tag: '[Camera]' });
  const { peer } = usePeer();

  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [peerConnection, setPeerConnection] = useState<DataConnection>();
  const [peerCall, setPeerCall] = useState<MediaConnection>();
  const sourcePeerId = useMemo(() => peerCall?.peer, [peerCall]);

  const {
    start: startStream,
    stop: stopStream,
  } = useCamera();

  const { majorStream, minorStream } = useMemo(() => ({
    majorStream: remoteStream,
    minorStream: localStream,
  }), [remoteStream, localStream]);

  const onAcceptPeerCall = useCallback(async () => {
    const selfStream = await startStream({ video: true, audio: true });

    setLocalStream(selfStream);
    logger.log('Peer stream ready', selfStream);
    peerCall?.answer(selfStream);

    peerCall?.on('stream', (peerStream) => {
      logger.log('Remote stream', peerStream);
      setLoadingMessage(`Got call from <${peerCall.peer}>`);
      setRemoteStream(peerStream);
      setPeerCall(undefined);
      setLoadingMessage(undefined);
    });
  }, [logger, peerCall, startStream]);

  const onRejectPeerCall = useCallback(() => {
    peerCall?.close();
    peerConnection?.close();
    setPeerCall(undefined);
    setLoadingMessage(undefined);
  }, [peerCall, peerConnection]);

  useEffect(() => {
    setLoadingMessage('Initializing');

    peer.once('open', (id) => {
      logger.log(`Peer ready <${id}>`);
      setLoadingMessage('Waiting for connection');

      peer.on('connection', (conn) => {
        logger.log(`Connection to <${conn.peer}>`);
        setLoadingMessage(`Connected to <${conn.peer}>`);
        setPeerConnection(conn);

        peer.on('call', async (call) => {
          logger.log(`Getting call from <${call.peer}>`);
          setPeerCall(call);
        });

        conn.on('close', () => {
          logger.log('Close');
        });

        conn.on('data', (data) => {
          const [key, value] = `${data}`.substring(1).split(':');

          logger.log('Data', key, value);

          switch (key) {
            case 'photo':
              break;

            default:
              break;
          }
        });

        conn.on('error', (err) => {
          logger.warn('Conn error', err);
        });
      });
    });
  }, [logger, peer]);

  useEffect(() => (
    () => {
      stopStream();
    }
  ), [stopStream]);

  return (
    <CameraView
      majorStream={majorStream}
      minorStream={minorStream}
    >
      <Tag>Camera</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
      <ConfirmModal
        show={!!peerCall}
        onYes={onAcceptPeerCall}
        onNo={onRejectPeerCall}
      >
        Accept photoer from {'<'}{sourcePeerId}{'>'}?
      </ConfirmModal>
    </CameraView>
  );
};

export default Camera;
