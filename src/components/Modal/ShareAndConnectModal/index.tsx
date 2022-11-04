import React, { FunctionComponent, PropsWithChildren } from 'react';

import { useConnectionContext } from '../../../contexts/ConnectionContext';

import Button from '../../Button';
import ShareButton from '../../ShareButton';

import Modal from '..';
import styles from './styles.module.scss';

interface ShareAndConnectModalProps {
  show: boolean;
  shareUrl: string;
  shareText: string;
  connectText: string;
  onClickConnect: () => void;
}

const ShareAndConnectModal: FunctionComponent<PropsWithChildren<ShareAndConnectModalProps>> = ({
  show,
  shareUrl,
  shareText,
  connectText,
  onClickConnect,
  children,
}) => {
  const { isOnline } = useConnectionContext();

  return (
    <Modal
      show={show}
      className={styles['share-and-connect-modal']}
      hideOnClickOutside={false}
    >
      <p>
        {children}
      </p>
      <ShareButton
        disabled={!isOnline}
        url={shareUrl}
      >
        {shareText}
      </ShareButton>
      <Button
        disabled={!isOnline}
        onClick={onClickConnect}
      >
        {connectText}
      </Button>
    </Modal>
  );
};

export default ShareAndConnectModal;
