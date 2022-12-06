import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useConnectionContext } from '../../../../contexts/ConnectionContext';
import { useModalContext } from '../../../../contexts/ModalContext';

import Clickable from '../../../../components/Clickable';

import shareData from '../../../../utils/shareData';

import { FunctionComponentWithClassName } from '../../../../types/ComponentProps';
import styles from './styles.module.scss';

interface ShareCameraProps {
  ask?: boolean;
  cameraUrl?: string;
}

const ShareCamera: FunctionComponentWithClassName<ShareCameraProps> = ({
  ask = false,
  className,
  cameraUrl,
}) => {
  const { isOnline, isMediaConnected } = useConnectionContext();
  const { askYesNo } = useModalContext();

  const disabled = useMemo(() => (
    isMediaConnected || !isOnline || !cameraUrl
  ), [isMediaConnected, isOnline, cameraUrl]);

  const askToShare = useCallback(async () => {
    if (!cameraUrl) {
      return;
    }

    const share = await askYesNo('Share camera link?');

    if (share) {
      shareData({
        url: cameraUrl,
      });
    }
  }, [askYesNo, cameraUrl]);

  useEffect(() => {
    if (ask) {
      askToShare();
    }
  }, [ask, askToShare]);

  return (
    <Clickable
      className={classnames(styles['share-camera'], className)}
      disabled={disabled}
      onClick={askToShare}
    >
      <FontAwesomeIcon icon={faShareNodes} />
    </Clickable>
  );
};

export default ShareCamera;
