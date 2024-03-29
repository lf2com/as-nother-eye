import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { OnCommand, OnHangUp, useConnectionContext } from '@/contexts/ConnectionContext';
import { CommandType } from '@/contexts/ConnectionContext/Command';
import { useModalContext } from '@/contexts/ModalContext';

import CameraView, { CameraViewProps } from '@/components/CameraView';
import Loading from '@/components/Loading';
import AskInputModal, { AskInputModalProps } from '@/components/Modal/AskInputModal';
import Tag from '@/components/Tag';

import Logger from '@/utils/logger';
import { minifyCameraStream, startStream, stopStream } from '@/utils/userMedia';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FC = () => {
  const params = useParams();
  const {
    id: connectionId,
    isOnline,
    isDataConnected,
    isMediaConnected,
    call,
    sendCommand,
    setOnCommand,
    setOnHangUp,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [disableShutter, setDisableShutter] = useState<boolean>();
  const [disableSwitchCamera, setDisableSwitchCamera] = useState<boolean>();
  const [disableFlipCamera, setDisableFlipCamera] = useState<boolean>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localMinStream, setLocalMinStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [targetId, setTargetId] = useState(params.targetId);
  const [showConnectCameraModal, setShowConnectCameraModal] = useState(!targetId);

  const hideConnectCameraModal = () => {
    setShowConnectCameraModal(false);
  };

  const onShutter = useCallback<CameraViewProps['onShutter']>(async () => {
    setDisableShutter(true);

    try {
      await sendCommand(CommandType.takePhoto, 0);
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice, sendCommand]);

  const onSwitchCamera = useCallback<CameraViewProps['onSwitchCamera']>(async () => {
    setDisableSwitchCamera(true);

    try {
      await sendCommand(CommandType.switchCamera, 'next');
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice, sendCommand]);

  const onFlipCamera = useCallback<CameraViewProps['onFlipCamera']>(async (direction) => {
    setDisableFlipCamera(true);

    try {
      await sendCommand(CommandType.flipCamera, direction);
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice, sendCommand]);

  const onCommand: OnCommand = (type, param) => {
    logger.log('command', type, param);

    switch (type) {
      case CommandType.takingPhoto:
        setDisableShutter(!!param);
        break;

      case CommandType.switchingCamera:
        setDisableSwitchCamera(!!param);
        break;

      case CommandType.flippingCamera:
        setDisableFlipCamera(!!param);
        break;

      default:
        break;
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
      hideConnectCameraModal();
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice]);

  const onClickMajor = (remoteStream
    ? undefined
    : () => setShowConnectCameraModal(true)
  );

  useEffect(() => {
    startStream()
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
      setLoadingMessage(`Connecting to <${targetId}>`);
      call(targetId, localMinStream)
        .then((stream) => {
          setRemoteStream(stream ?? undefined);
        })
        .catch((error) => {
          notice(`${error}`);
        })
        .finally(() => {
          setLoadingMessage(undefined);
        });
    }
  }, [call, localMinStream, notice, targetId]);

  useEffect(() => {
    if (isDataConnected) {
      setOnCommand(onCommand);
    }

    return () => {
      setOnCommand();
    };
  }, [isDataConnected, setOnCommand]);

  useEffect(() => {
    if (isMediaConnected) {
      setOnHangUp(onHangUp);
      setDisableShutter(false);
      setDisableSwitchCamera(false);
      setDisableFlipCamera(false);
    }

    return () => {
      setOnHangUp();
      setDisableShutter(true);
      setDisableSwitchCamera(true);
      setDisableFlipCamera(true);
    };
  }, [isMediaConnected, setOnHangUp]);

  useEffect(() => () => {
    if (isOnline) {
      onHangUp();
    }
  }, [isOnline]);

  useEffect(() => {
    if (isMediaConnected && showConnectCameraModal) {
      hideConnectCameraModal();
    }
  }, [isMediaConnected, showConnectCameraModal]);

  useEffect(() => {
    setDisableShutter(true);
    setDisableSwitchCamera(true);
    setDisableFlipCamera(true);

    return () => {
      onHangUp();
    };
  }, []);

  return (
    <CameraView
      className={styles.photoer}
      disableShutter={disableShutter}
      disableSwitchCamera={disableSwitchCamera}
      disableFlipCamera={disableFlipCamera}
      onShutter={onShutter}
      onSwitchCamera={onSwitchCamera}
      onFlipCamera={onFlipCamera}
      majorContent={remoteStream ?? 'Connect to Camera'}
      minorContent={localStream}
      onClickMajor={onClickMajor}
    >
      <div className={styles.title}>
        <Tag>Photoer #{connectionId}</Tag>
      </div>

      <AskInputModal
        show={showConnectCameraModal}
        onCancel={hideConnectCameraModal}
        onConfirm={onConnectCamera}
        onClickOutside={hideConnectCameraModal}
      >
        Connect to camera
      </AskInputModal>

      <Loading
      >
        {loadingMessage}
      </Loading>
    </CameraView>
  );
};

export default Photoer;
