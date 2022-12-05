import React, { FunctionComponent, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import Tag from '../../components/Tag';
import CameraView, { CameraViewProps } from '../components/CameraView';
import PhotoManagement, { PhotoManagementProps } from '../components/PhotoManagement';

import createRoutePath from '../../utils/createRoutePath';
import { downloadFiles } from '../../utils/downloadFile';
import Logger from '../../utils/logger';
import shareData from '../../utils/shareData';
import { startStream, switchCamera } from '../../utils/userMedia';

import styles from './styles.module.scss';

interface CameraProps {
}

const logger = new Logger({ tag: '[Camera]' });

const Camera: FunctionComponent<CameraProps> = () => {
  const params = useParams();
  const { targetId } = params;
  const {
    connector,
    id: connectorId,
    peerId,
  } = useConnectionContext();
  const { notice } = useModalContext();
  const [disabledSwitchCamera, setDisabledSwitchCamera] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Blob[]>([]);

  const createShareUrl = useCallback<CameraViewProps['shareUrlGenerator']>((id) => (
    createRoutePath(`/photoer/${id}`)
  ), []);

  const takePhoto = useCallback(async () => {
    if (!localStream) {
      return;
    }

    const track = localStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    setTakingPhoto(true);

    const photoBlob = await imageCapture.takePhoto({
      fillLightMode: 'auto', // 'auto' | 'off' | 'flash'
      redEyeReduction: true,
    });

    setPhotos((prevPhotos) => prevPhotos.concat(photoBlob));
    setTakingPhoto(false);
  }, [localStream]);

  const handleSwitchCamera = useCallback<Required<CameraViewProps>['onSwitchCamera']>(async () => {
    if (!localStream) {
      return;
    }

    setDisabledSwitchCamera(true);

    try {
      await switchCamera(localStream);

      if (peerId) {
        await connector.call(peerId, localStream);
      }
    } catch (error) {
      notice(`${error}`);
    }

    setDisabledSwitchCamera(false);
  }, [connector, localStream, notice, peerId]);

  const onPhoto = takePhoto;

  const onData = useCallback<CameraViewProps['onData']>((data) => {
    const message = data as string;

    logger.log('DATA', data);

    if (/^#/.test(message)) {
      logger.log('MESSAGE', message.substring(1));
      switch (message.substring(1)) {
        case 'photo':
          logger.log('GOTO TAKE PHOTO');
          takePhoto();
          break;

        case 'switchcamera':
          handleSwitchCamera({}).finally(() => {
            connector.sendMessage(peerId!, '#switchcamera');
          });
          break;

        default:
          break;
      }
    }
  }, [connector, handleSwitchCamera, peerId, takePhoto]);

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
  }) => {
    setLocalStream(local);

    return {
      major: local,
      minor: remote,
    };
  }, []);

  const onSaveSelectedPhotos = useCallback<PhotoManagementProps['onSave']>((selectedPhotos) => {
    downloadFiles(selectedPhotos);
  }, []);

  const onShareSelectedPhotos = useCallback<PhotoManagementProps['onShare']>(async (selectedPhotos) => {
    try {
      await shareData({
        files: selectedPhotos,
      });
    } catch (error) {
      notice(`${error}`);
    }
  }, [notice]);

  return (
    <CameraView
      className={styles.camera}
      targetId={targetId}
      shareText="Share Camera"
      connectText="Connect Photoer"
      askConnectText="Connect to photoer"
      waitingConnectionText="Waiting for photoer to connect"
      mediaStreamGenerator={getStream}
      mediaStreamConverter={convertStream}
      shareUrlGenerator={createShareUrl}
      onShot={onPhoto}
      onCall={onCall}
      onData={onData}
      onHangUp={onHangUp}
      onSwitchCamera={handleSwitchCamera}
      disabledSwitchCamera={disabledSwitchCamera}
      showTakePhotoAnimation={takingPhoto}
    >
      <Tag>Camera #{connectorId}</Tag>

      <PhotoManagement
        className={styles['photo-list']}
        photos={photos}
        onShare={onShareSelectedPhotos}
        onSave={onSaveSelectedPhotos}
      />
    </CameraView>
  );
};

export default Camera;
