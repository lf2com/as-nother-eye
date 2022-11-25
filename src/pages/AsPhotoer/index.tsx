import React, { FunctionComponent, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';

import Tag from '../../components/Tag';
import CameraView, { CameraViewProps } from '../components/CameraView';

import createRoutePath from '../../utils/createRoutePath';
import Logger from '../../utils/logger';
import { startStream } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface PhotoerProps {
}

const logger = new Logger({ tag: '[Photoer]' });

const Photoer: FunctionComponent<PhotoerProps> = () => {
  const params = useParams();
  const { targetId } = params;
  const {
    connector,
    id: connectorId,
    peerId,
  } = useConnectionContext();
  const [disabledSwitchCamera, setDisabledSwitchCamera] = useState(false);

  const createShareUrl = useCallback<CameraViewProps['shareUrlGenerator']>((id) => (
    createRoutePath(`/camera/${id}`)
  ), []);

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

  const handleSwitchCamera = useCallback(async () => {
    setDisabledSwitchCamera(true);
    connector.sendMessage(peerId!, '#switchcamera');
  }, [connector, peerId]);

  return (
    <CameraView
      className={styles.photoer}
      targetId={targetId}
      shareText="Share Photoer"
      connectText="Connect Camera"
      askConnectText="Connect to camera"
      waitingConnectionText="Waiting for camera to connect"
      mediaStreamGenerator={getStream}
      mediaStreamConverter={convertStream}
      shareUrlGenerator={createShareUrl}
      onShot={onPhoto}
      onCall={onCall}
      onData={onData}
      onHangUp={onHangUp}
      onSwitchCamera={handleSwitchCamera}
      disabledSwitchCamera={disabledSwitchCamera}
    >
      <Tag>Photoer #{connectorId}</Tag>
    </CameraView>
  );
};

export default Photoer;
