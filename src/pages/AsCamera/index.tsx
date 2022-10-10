import classnames from 'classnames';
import { DataConnection, MediaConnection } from 'peerjs';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import Shutter from '../../components/CameraShutter';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Tag from '../../components/Tag';
import Video from '../../components/Video';

import usePeer from '../../hooks/usePeer';

import Logger from '../../utils/logger';
import { startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Camera]' });

const Camera = () => {
  const { peer } = usePeer();
  const majorVideoRef = useRef<HTMLVideoElement>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [peerConnection, setPeerConnection] = useState<DataConnection>();
  const [peerCall, setPeerCall] = useState<MediaConnection>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [handlingPhoto, setHandlingPhoto] = useState<boolean>(false);
  const sourcePeerId = useMemo(() => peerCall?.peer, [peerCall]);

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

  const onAcceptPeerCall = useCallback(async () => {
    try {
      const selfStream = await startStream();

      logger.log('Peer stream ready', selfStream);
      setLocalStream(selfStream);
      peerCall?.answer(selfStream);

      peerCall?.on('stream', (peerStream) => {
        logger.log('Remote stream', peerStream);
        setLoadingMessage(`Got call from <${peerCall.peer}>`);
        setRemoteStream(peerStream);
        setPeerCall(undefined);
        setLoadingMessage(undefined);
      });
    } catch (error) {
      logger.warn(error);
    }
  }, [peerCall]);

  const onRejectPeerCall = useCallback(() => {
    peerCall?.close();
    peerConnection?.close();
    setPeerCall(undefined);
    setLoadingMessage(undefined);
  }, [peerCall, peerConnection]);

  const onPhoto = takePhoto;

  const afterTakingPhoto = useCallback(() => {
    setTakingPhoto(false);
  }, []);

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
      });
    });
  }, [peer]);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.on('error', (error) => {
        logger.warn('Conn error', error);
      });

      peerConnection.on('close', () => {
        logger.log('Close');
      });

      peerConnection.on('data', (data) => {
        const [key, value] = `${data}`.substring(1).split(':');

        logger.log('Data', key, value);

        switch (key) {
          case 'photo':
            takePhoto();
            break;

          default:
            break;
        }
      });
    }

    return () => {
      if (peerConnection) {
        peerConnection.off('error');
        peerConnection.off('close');
        peerConnection.off('data');
      }
    };
  }, [peerConnection, takePhoto]);

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
      <ConfirmModal
        show={!!(peerCall && !localStream)}
        onYes={onAcceptPeerCall}
        onNo={onRejectPeerCall}
      >
        Accept photoer from {'<'}{sourcePeerId}{'>'}?
      </ConfirmModal>
      <Frame
        className={classnames(styles.major, {
          [styles['taking-photo']]: takingPhoto,
        })}
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
