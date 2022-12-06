import React, { FunctionComponent, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import CameraView, { CameraViewProps } from '../../components/CameraView';
import { AskInputModalProps } from '../../components/Modal/AskInputModal';
import Tag from '../../components/Tag';
import ConnectCamera from './components/ConnectCamera';

import Logger from '../../utils/logger';
import { startStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface PhotoerProps {
}

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const params = useParams();
  const {
    connector,
    id: connectorId,
    peerId,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [disabledSwitchCamera, setDisabledSwitchCamera] = useState(false);
  const [targetId, setTargetId] = useState(params.targetId);

  const onPhoto = useCallback(() => {
    connector.sendMessage(peerId!, '#photo');
  }, [connector, peerId]);

  const onData = useCallback<CameraViewProps['onData']>((data) => {
    const message = data as string;

    logger.log('DATA', data);

    if (/^#/.test(message)) {
      logger.log('MESSAGE', message.substring(1));
      switch (message.substring(1)) {
        case 'switchcamera':
          logger.log('SWITCHED CAMERA');
          setDisabledSwitchCamera(false);
          break;

        default:
          break;
      }
    }

    // const blob = new Blob([data as ArrayBuffer]);
  }, []);

  const onCall: CameraViewProps['onCall'] = () => true;

  const onHangUp = useCallback<CameraViewProps['onHangUp']>(() => {
    logger.log('Closed');
  }, []);

  const getStream = useCallback<Required<CameraViewProps>['mediaStreamGenerator']>(async () => (
    startStream({
      video: true,
    })
  ), []);

  const convertStream = useCallback<Required<CameraViewProps>['mediaStreamConverter']>(({
    local,
    remote,
  }) => ({
    major: remote,
    minor: local,
  }), []);

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

  const handleSwitchCamera = useCallback(async () => {
    setDisabledSwitchCamera(true);
    connector.sendMessage(peerId!, '#switchcamera');
  }, [connector, peerId]);

  return (
    <CameraView
      className={styles.photoer}
      targetId={targetId}
      mediaStreamGenerator={getStream}
      mediaStreamConverter={convertStream}
      onShot={onPhoto}
      onCall={onCall}
      onData={onData}
      onHangUp={onHangUp}
      onSwitchCamera={handleSwitchCamera}
      disabledSwitchCamera={disabledSwitchCamera}
    >
      <Tag className={styles.tag}>
        Photoer #{connectorId}

        <ConnectCamera
          ask
          className={styles['connect-camera']}
          onConnectCamera={onConnectCamera}
        />
      </Tag>
    </CameraView>
  );
};

export default Photoer;
