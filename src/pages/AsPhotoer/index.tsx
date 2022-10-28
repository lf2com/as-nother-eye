import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import PhotoList from '../../components/PhotoList';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import Logger from '../../utils/logger';
import RemoteConnection from '../../utils/RemoteConnection';
import EventHandler from '../../utils/RemoteConnection/event/handler';
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
  const [photos, setPhotos] = useState<Blob[]>([]);

  logger.log('target id', targetId);

  const onPhoto = useCallback(() => {
    remoteConnection.sendMessage(targetId, '#photo');
  }, [remoteConnection, targetId]);

  const onGetData = useCallback<EventHandler['data']>((_, data) => {
    logger.log('DATA', data);

    const blob = new Blob([data as ArrayBuffer]);

    setPhotos((prevPhotos) => [...prevPhotos, blob]);
  }, []);

  useEffect(() => {
    logger.log('Initializing');
    setLoadingMessage('Initializing');
    remoteConnection.connect()
      .then(async () => {
        logger.log('Connected to server');
        setLoadingMessage('Connected to server');

        return startStream();
      })
      .then(async (selfStream) => {
        try {
          const peerStream = await remoteConnection.call(targetId, selfStream);

          setLocalStream(selfStream);
          logger.log(`Connection to <${targetId}>`, selfStream);
          setLoadingMessage(`Connected to <${targetId}>. Calling peer`);
          logger.log('Peer stream ready', peerStream);
          setLoadingMessage(`Called <${targetId}>`);
          setRemoteStream(peerStream);
          setLoadingMessage(undefined);

          remoteConnection.addEventListener('data', onGetData);
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
      })
      .catch((error) => {
        logger.warn('Failed to init remote connection', error);
      })
      .finally(() => {
        setLoadingMessage(undefined);
      });

    return () => {
      remoteConnection.removeEventListener('data', onGetData);
    };
  }, [onGetData, remoteConnection, targetId]);

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
      <Tag>Photoer #{remoteConnection.id}</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
      <Frame className={styles.major}>
        <Video srcObject={remoteStream} />
      </Frame>
      <Video
        className={styles.minor}
        srcObject={localStream}
      />
      <Shutter
        className={styles.shutter}
        disabled={!remoteConnection.isOnline}
        onShot={onPhoto}
      />
      <PhotoList
        className={styles['photo-list']}
        photos={photos}
        size={5}
      />
    </Frame>
  );
};

export default Photoer;
