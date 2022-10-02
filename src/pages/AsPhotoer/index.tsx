import React, { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useLoggerContext } from '../../contexts/LoggerContext';

import CameraView from '../../components/CameraView';
import Loading from '../../components/Loading';
import Tag from '../../components/Tag';

import usePeer from '../../hooks/usePeer';

import getUserMedia from '../../utils/getUserMedia';

interface PhotoerProps {
}

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const { logger } = useLoggerContext();
  const { targetId } = useParams();
  const { peer } = usePeer();
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();

  useEffect(() => {
    setLoadingMessage('Initializing');

    peer.once('open', (id) => {
      logger.log(`Peer ready <${id}>`);

      if (!targetId) {
        return;
      }

      const conn = peer.connect(targetId);

      setLoadingMessage(`Connecting to <${targetId}>`);

      conn.on('open', async () => {
        const selfStream = await getUserMedia({ video: true, audio: true });
        const call = peer.call(targetId, selfStream);

        setLocalStream(selfStream);
        logger.log(`Connection to <${targetId}>`, selfStream);
        setLoadingMessage(`Connected to <${conn.peer}>. Calling peer`);

        call.on('stream', (peerStream) => {
          logger.log('Peer stream ready', peerStream);
          setLoadingMessage(`Called <${conn.peer}>`);
          setRemoteStream(peerStream);
          setLoadingMessage(undefined);
        });

        call.on('close', () => {
          logger.log('Closed');
        });

        call.on('error', (error) => {
          logger.warn('Error', error);
        });

        call.on('iceStateChanged', (state) => {
          logger.log('Ice state changed', state);
        });
      });

      conn.on('error', (err) => {
        logger.warn('Conn error', err);
      });

      peer.on('connection', (conn2) => {
        logger.log('Peer connection', conn2);
      });

      peer.on('error', (err) => {
        logger.warn('Peer error', err);
      });

      peer.on('call', (call) => {
        logger.log(`Getting call from <${call.peer}>`);
      });
    });
  }, [logger, peer, targetId]);

  return (
    <CameraView
      majorStream={remoteStream}
      minorStream={localStream}
    >
      <Tag>Photoer</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
    </CameraView>
  );
};

export default Photoer;
