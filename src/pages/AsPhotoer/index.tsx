import React, { FunctionComponent, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';

import Tag from '../../components/Tag';
import CameraView, { CameraViewProps } from '../components/CameraView';

import Logger from '../../utils/logger';
import { getCameras, startStream } from '../../utils/userMedia';

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

  const createShareUrl = useCallback<CameraViewProps['shareUrlGenerator']>((id) => (
    new URL(`/camera/${id}`, globalThis.location.href).toString()
  ), []);

  const onPhoto = useCallback(() => {
    connector.sendMessage(peerId!, '#photo');
  }, [connector, peerId]);

  const onData = useCallback<CameraViewProps['onData']>((data) => {
    logger.log('DATA', data);

    // const blob = new Blob([data as ArrayBuffer]);
  }, []);

  const onCall: CameraViewProps['onCall'] = () => true;

  const onHangUp = useCallback<CameraViewProps['onHangUp']>(() => {
    logger.log('Closed');
  }, []);

  const getStream = useCallback<Required<CameraViewProps>['mediaStreamGenerator']>(async () => {
    const cameras = await getCameras();
    const camera = cameras.find((info) => /front$/i.test(info.label));

    return startStream({
      video: {
        deviceId: camera?.deviceId,
        // facingMode: 'user',
      },
    });
  }, []);

  const convertStream = useCallback<Required<CameraViewProps>['mediaStreamConverter']>(({
    local,
    remote,
  }) => ({
    major: remote,
    minor: local,
  }), []);

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
    >
      <Tag>Photoer #{connectorId}</Tag>
    </CameraView>
  );
};

export default Photoer;
