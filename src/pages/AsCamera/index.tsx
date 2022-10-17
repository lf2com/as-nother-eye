import classnames from 'classnames';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useModalContext } from '../../contexts/ModalContext';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import Logger from '../../utils/logger';
import RemoteConnection from '../../utils/remoteConnection';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Camera]' });

const Camera = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') as string;
  const remoteConnection = useMemo(() => new RemoteConnection({ id, connect: false }), [id]);
  const { askYesNo } = useModalContext();
  const majorVideoRef = useRef<HTMLVideoElement>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [handlingPhoto, setHandlingPhoto] = useState<boolean>(false);

  logger.log('id', id);

  const majorClassName = useMemo(() => classnames(styles.major, {
    [styles['taking-photo']]: takingPhoto,
  }), [takingPhoto]);

  const holdMajorVideo = useMemo(() => (
    takingPhoto || handlingPhoto
  ), [handlingPhoto, takingPhoto]);

  const takePhoto = useCallback(async () => {
    const track = localStream?.getVideoTracks()[0];

    if (!track) {
      return;
    }

    setHandlingPhoto(true);
    setTakingPhoto(true);

    const imageCapture = new ImageCapture(track);
    const photoBlob = await imageCapture.takePhoto();

    setHandlingPhoto(false);
  }, [localStream]);

  const onPhoto = takePhoto;

  const afterTakingPhoto = useCallback(() => {
    setTakingPhoto(false);
  }, []);

  useEffect(() => {
    setLoadingMessage('Initializing');
    remoteConnection.connectToServer()
      .then(() => {
        logger.log('Connected to server');
        setLoadingMessage('Connected to server');

        remoteConnection.addEventListener('call', async (sourceId, answer) => {
          logger.log(`Get call from <${sourceId}>`);

          const acceptPeerCall = await askYesNo(`Accept photoer from <${sourceId}>?`);

          if (!acceptPeerCall) {
            setLoadingMessage(undefined);
            answer(false);
            return;
          }

          try {
            const selfStream = await startStream();

            logger.log('My stream ready', selfStream);
            setLocalStream(selfStream);

            const peerStream = await answer(true, selfStream) as MediaStream;

            logger.log('Remote stream', peerStream);
            setLoadingMessage(`Got call from <${sourceId}>`);
            setRemoteStream(peerStream);
            setLoadingMessage(undefined);

            remoteConnection.addEventListener('data', (_, data) => {
              console.log('DATA', data);
            });
          } catch (error) {
            logger.warn(error);
          }
        });
      })
      .catch((error) => {
        logger.warn('Failed to init remote connection', error);
      });
  }, [askYesNo, remoteConnection]);

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

  logger.log({
    localStream, remoteStream, takingPhoto, handlingPhoto, holdMajorVideo,
  });

  return (
    <Frame className={styles.camera}>
      <Tag>Camera</Tag>
      <Loading show={!!loadingMessage}>
        {loadingMessage}
      </Loading>
      {/* <ConfirmModal
        show={!!(peerCall && !localStream)}
        onYes={onAcceptPeerCall}
        onNo={onRejectPeerCall}
      >
        Accept photoer from {'<'}{sourcePeerId}{'>'}?
      </ConfirmModal> */}
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
    </Frame>
  );
};

export default Camera;
