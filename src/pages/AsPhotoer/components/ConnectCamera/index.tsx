import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';

import { useConnectionContext } from '../../../../contexts/ConnectionContext';

import Clickable from '../../../../components/Clickable';
import AskInputModal from '../../../../components/Modal/AskInputModal';

import { FunctionComponentWithClassName } from '../../../../types/ComponentProps';
import styles from './styles.module.scss';

interface ConnectCameraProps {
  ask?: boolean;
  onConnectCamera: (id: string)=> void;
}

const ConnectCamera: FunctionComponentWithClassName<ConnectCameraProps> = ({
  ask = false,
  className,
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
    <span className={classnames(styles['connect-camera'], className)}>
      <Clickable
        className={styles.button}
        disabled={disabled}
        onClick={showConnectCameraModal}
      >
        <FontAwesomeIcon icon={faLink} />
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
