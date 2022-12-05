import React, {
  FunctionComponent, PropsWithChildren, useCallback, useState,
} from 'react';

import { useConnectionContext } from '../../../contexts/ConnectionContext';

import shareData from '../../../utils/shareData';

import Button from '../../Button';
import AskInputModal, { AskInputModalProps } from '../AskInputModal';

import Modal from '..';
import styles from './styles.module.scss';

interface ShareAndConnectModalProps {
  show: boolean;
  shareUrl: string;
  shareText: string;
  connectText: string;
  askConnectText: string;
  onConnect: (id: string) => void;
}

const ShareAndConnectModal: FunctionComponent<PropsWithChildren<ShareAndConnectModalProps>> = ({
  show,
  shareUrl,
  shareText,
  connectText,
  askConnectText,
  onConnect,
  children,
}) => {
  const { isOnline } = useConnectionContext();
  const [showIdModal, setShowIdModal] = useState(false);
  const hideIdModal = useCallback(() => setShowIdModal(false), []);
  const onClickConnectButton = useCallback(() => setShowIdModal(true), []);

  const shareLink = useCallback(() => shareData({
    url: shareUrl,
  }), [shareUrl]);

  const handleConnect = useCallback<AskInputModalProps['onConfirm']>((id) => {
    setShowIdModal(false);
    onConnect(id);
  }, [onConnect]);

  return (
    <Modal
      show={show}
      className={styles['share-and-connect-modal']}
    >
      <p>
        {children}
      </p>
      <Button
        disabled={!isOnline}
        onClick={shareLink}
      >
        {shareText}
      </Button>
      <Button
        disabled={!isOnline}
        onClick={onClickConnectButton}
      >
        {connectText}
      </Button>

      <AskInputModal
        show={showIdModal}
        onCancel={hideIdModal}
        onConfirm={handleConnect}
      >
        {askConnectText}
      </AskInputModal>
    </Modal>
  );
};

export default ShareAndConnectModal;
