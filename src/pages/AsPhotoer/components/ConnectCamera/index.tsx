import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  FunctionComponent, useEffect, useMemo, useState,
} from 'react';

import { useConnectionContext } from '../../../../contexts/ConnectionContext';

import Clickable from '../../../../components/Clickable';
import AskInputModal from '../../../../components/Modal/AskInputModal';
import ShadowWrapper from '../../../../components/ShadowWrapper';

import styles from './styles.module.scss';

interface ConnectCameraProps {
  ask?: boolean;
  onConnectCamera: (id: string)=> void;
}

const ConnectCamera: FunctionComponent<ConnectCameraProps> = ({
  ask = false,
  onConnectCamera,
}) => {
  const { isOnline, isMediaConnected } = useConnectionContext();
  const [showModal, setShowModal] = useState(false);

  const disabled = useMemo(() => (
    isMediaConnected || !isOnline
  ), [isMediaConnected, isOnline]);

  const showConnectCameraModal = () => {
    setShowModal(true);
  };

  const hideConnectCameraModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    setShowModal(ask);
  }, [ask]);

  return (
    <span className={styles['connect-camera']}>
      <Clickable
        className={styles.button}
        disabled={disabled}
        onClick={showConnectCameraModal}
      >
        <ShadowWrapper>
          <FontAwesomeIcon icon={faLink} />
        </ShadowWrapper>
      </Clickable>

      <AskInputModal
        show={showModal}
        onCancel={hideConnectCameraModal}
        onConfirm={onConnectCamera}
        onClickOutside={hideConnectCameraModal}
      >
        Connect to camera
      </AskInputModal>
    </span>
  );
};

export default ConnectCamera;
