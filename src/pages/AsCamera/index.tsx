import { MediaConnection } from 'peerjs';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useLoggerContext } from '../../contexts/LoggerContext';

import CameraView from '../../components/CameraView';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Tag from '../../components/Tag';

import usePeer from '../../hooks/usePeer';

import getUserMedia from '../../utils/getUserMedia';

const Camera = () => {
  const { logger } = useLoggerContext();
  const { peer } = usePeer();
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [peerCall, setPeerCall] = useState<MediaConnection>();
  const sourcePeerId = useMemo(() => peerCall?.peer, [peerCall]);
  const { majorStream, minorStream } = useMemo(() => ({
    majorStream: remoteStream,
    minorStream: localStream,
  }), [remoteStream, localStream]);

  const onAcceptPeerCall = useCallback(async () => {
    const selfStream = await getUserMedia({ video: true, audio: true });

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
  }, [logger, peerCall]);

  const onRejectPeerCall = useCallback(() => {
    peerCall?.close();
    setPeerCall(undefined);
    setLoadingMessage(undefined);
  }, [peerCall]);

  useEffect(() => {
    setLoadingMessage('Initializing');

    peer.once('open', (id) => {
      logger.log(`Peer ready <${id}>`);
      setLoadingMessage('Waiting for connection');

      peer.on('connection', (conn) => {
        logger.log(`Connection to <${conn.peer}>`);
        setLoadingMessage(`Connected to <${conn.peer}>`);

        peer.on('call', async (call) => {
          logger.log(`Getting call from <${call.peer}>`);
          setPeerCall(call);
        });
      });
    });
  }, [logger, peer]);

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
