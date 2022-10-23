import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import Logger from '../../utils/logger';
import RemoteConnection from '../../utils/RemoteConnection';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface PhotoerProps {
}

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const params = useParams();
  const targetId = useMemo(() => params.targetId as string, [params]);
  const remoteConnection = useMemo(() => new RemoteConnection(), []);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();

  logger.log('target id', targetId);

  const onPhoto = useCallback(() => {
    remoteConnection.sendMessage(targetId, '#photo');
  }, [remoteConnection, targetId]);

  useEffect(() => {
    setLoadingMessage('Initializing');
    remoteConnection.connect()
      .then(async () => {
        logger.log('Connected to server');
        setLoadingMessage('Connected to server');

        try {
          const selfStream = await startStream();

          try {
            const peerStream = await remoteConnection.call(targetId, selfStream);

            setLocalStream(selfStream);
            logger.log(`Connection to <${targetId}>`, selfStream);
            setLoadingMessage(`Connected to <${targetId}>. Calling peer`);
            logger.log('Peer stream ready', peerStream);
            setLoadingMessage(`Called <${targetId}>`);
            setRemoteStream(peerStream);
            setLoadingMessage(undefined);

            remoteConnection.addEventListener('hangup', () => {
              logger.log('Closed');
              selfStream.getTracks().forEach((track) => {
                track.stop();
              });
            });
          } catch (error) {
            stopStream(selfStream);

            throw error;
          }
        } catch (error) {
          logger.warn(error);
          setLoadingMessage(undefined);
        }
      })
      .catch((error) => {
        console.warn('Failed to init remote connection', error);
      });
  }, [remoteConnection, targetId]);

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
        disabled={!remoteConnection.isOnline}
        onShot={onPhoto}
      />
    </Frame>
  );
};

export default Photoer;
