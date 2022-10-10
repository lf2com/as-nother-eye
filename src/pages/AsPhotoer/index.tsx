import { DataConnection } from 'peerjs';
import React, {
  FunctionComponent, useCallback, useEffect, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import usePeer from '../../hooks/usePeer';

import Logger from '../../utils/logger';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface PhotoerProps {
}

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const { targetId } = useParams();
  const { peer } = usePeer();
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [peerConnection, setPeerConnection] = useState<DataConnection>();

  const onPhoto = useCallback(() => {
    if (!peer || !peerConnection) {
      return;
    }

    peerConnection.send('#photo');
  }, [peer, peerConnection]);

  useEffect(() => {
    setLoadingMessage('Initializing');

    peer.once('open', async (id) => {
      logger.log(`Peer ready <${id}>`);

      if (!targetId) {
        return;
      }

      const conn = peer.connect(targetId);

      logger.log(`Connecting to <${targetId}>`);
      setLoadingMessage(`Connecting to <${targetId}>`);

      conn.on('open', async () => {
        const selfStream = await startStream();
        const call = peer.call(targetId, selfStream);

        setLocalStream(selfStream);
        logger.log(`Connection to <${targetId}>`, selfStream);
        setLoadingMessage(`Connected to <${conn.peer}>. Calling peer`);

        call.on('stream', (peerStream) => {
          logger.log('Peer stream ready', peerStream);
          setLoadingMessage(`Called <${conn.peer}>`);
          setRemoteStream(peerStream);
          setPeerConnection(conn);
          setLoadingMessage(undefined);
        });

        call.on('close', () => {
          logger.log('Closed');
          selfStream.getTracks().forEach((track) => {
            track.stop();
          });
        });

        call.on('error', (error) => {
          logger.warn('Error', error);
        });

        call.on('iceStateChanged', (state) => {
          logger.log('Ice state changed', state);
        });

        conn.send('#ask:call');

        conn.on('close', () => {
          logger.log('Close');
          selfStream.getTracks().forEach((track) => {
            track.stop();
          });
        });

        conn.on('data', (data) => {
          logger.log('Data', data);
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
  }, [peer, targetId]);

  useEffect(() => (
    () => {
      if (localStream) {
        stopStream(localStream);
      }
    }
  ), [localStream]);

  return (
    <Frame className={styles.photoer}>
      <Tag>Photoer</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
      <Frame className={styles.major}>
        <Video srcObject={localStream} />
      </Frame>
      <Video
        className={styles.minor}
        srcObject={remoteStream}
      />
      <Shutter
        className={styles.shutter}
        onShot={onPhoto}
      />
    </Frame>
  );
};

export default Photoer;
