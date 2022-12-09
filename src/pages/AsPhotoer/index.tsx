import React, {
  FunctionComponent, useCallback, useEffect, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { OnHangUp, OnMessage, useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import CameraView, { CameraViewProps } from '../../components/CameraView';
import { AskInputModalProps } from '../../components/Modal/AskInputModal';
import Tag from '../../components/Tag';
import ConnectCamera from './components/ConnectCamera';

import Logger from '../../utils/logger';
import { minifyCameraStream, startStream, stopStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent = () => {
  const params = useParams();
  const {
    id: connectionId,
    isOnline,
    isDataConnected,
    isMediaConnected,
    call,
    sendMessage,
    setOnMessage,
    setOnHangUp,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [disableShutter, setDisableShutter] = useState<boolean>();
  const [disableSwitchCamera, setDisableSwitchCamera] = useState<boolean>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localMinStream, setLocalMinStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [targetId, setTargetId] = useState(params.targetId);

  const onShutter = useCallback<CameraViewProps['onShutter']>(() => {
    setDisableShutter(true);
    sendMessage('#photo');
  }, [sendMessage]);

  const onSwitchCamera = useCallback<CameraViewProps['onSwitchCamera']>(async () => {
    setDisableSwitchCamera(true);
    sendMessage('#switchcamera');
  }, [sendMessage]);

  const onMessage: OnMessage = (message) => {
    logger.log('message', message);

    if (/^#/.test(message)) {
      switch (message.substring(1)) {
        case 'photo':
          setDisableShutter(true);
          break;

        case 'photoed':
          setDisableShutter(false);
          break;

        case 'switchcamera':
          setDisableSwitchCamera(true);
          break;

        case 'switchedcamera':
          setDisableSwitchCamera(false);
          break;

        default:
          break;
      }
    }

    // const blob = new Blob([data as ArrayBuffer]);
  };

  const onHangUp: OnHangUp = () => {
    setLocalStream(undefined);
    setLocalMinStream(undefined);
    setRemoteStream(undefined);
  };

  const onConnectCamera = useCallback<AskInputModalProps['onConfirm']>((id) => {
    try {
      if (id.length === 0) {
        throw ReferenceError('No Camera ID');
      }

      setTargetId(id);
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice]);

  useEffect(() => {
    startStream({
      video: true,
    })
      .then((stream) => {
        setLocalStream(stream);
        setLocalMinStream(minifyCameraStream(stream));
      })
      .catch((error) => {
        notice(`Failed to init stream: ${error}`);
      });
  }, [notice]);

  useEffect(() => {
    if (localStream) {
      setLocalMinStream(minifyCameraStream(localStream));
    } else {
      setLocalMinStream(undefined);
    }

    return () => {
      if (localStream) {
        stopStream(localStream);
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (localMinStream && targetId) {
      call(targetId, localMinStream)
        .then((stream) => {
          setRemoteStream(stream ?? undefined);
        });
    }
  }, [call, localMinStream, targetId]);

  useEffect(() => {
    if (isDataConnected) {
      setOnMessage(onMessage);
    }

    return () => {
      setOnMessage();
    };
  }, [isDataConnected, setOnMessage]);

  useEffect(() => {
    if (isMediaConnected) {
      setOnHangUp(onHangUp);
      setDisableShutter(false);
      setDisableSwitchCamera(false);
    }

    return () => {
      setOnHangUp();
      setDisableShutter(true);
      setDisableSwitchCamera(true);
    };
  }, [isMediaConnected, setOnHangUp]);

  useEffect(() => () => {
    if (isOnline) {
      onHangUp();
    }
  }, [isOnline]);

  useEffect(() => {
    setDisableShutter(true);
    setDisableSwitchCamera(true);

    return () => {
      onHangUp();
    };
  }, []);

  return (
    <CameraView
      className={styles.photoer}
      disableShutter={disableShutter}
      disableSwitchCamera={disableSwitchCamera}
      onShutter={onShutter}
      onSwitchCamera={onSwitchCamera}
      majorStream={remoteStream}
      minorStream={localStream}
    >
      <div className={styles.title}>
        <Tag>Photoer #{connectionId}</Tag>

        <ConnectCamera
          ask={!isMediaConnected}
          onConnectCamera={onConnectCamera}
        />
      </div>
    </CameraView>
  );
};

export default Photoer;
