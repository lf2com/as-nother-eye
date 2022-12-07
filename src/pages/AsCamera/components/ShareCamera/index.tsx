import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  FunctionComponent, useCallback, useEffect, useMemo,
} from 'react';

import { useConnectionContext } from '../../../../contexts/ConnectionContext';
import { useModalContext } from '../../../../contexts/ModalContext';

import Clickable from '../../../../components/Clickable';
import ShadowWrapper from '../../../../components/ShadowWrapper';

import shareData from '../../../../utils/shareData';

import styles from './styles.module.scss';

interface ShareCameraProps {
  ask?: boolean;
  cameraUrl?: string;
}

const ShareCamera: FunctionComponent<ShareCameraProps> = ({
  ask = false,
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
      className={styles['share-camera']}
      disabled={disabled}
      onClick={askToShare}
    >
      <ShadowWrapper>
        <FontAwesomeIcon icon={faShareNodes} />
      </ShadowWrapper>
    </Clickable>
  );
};

export default ShareCamera;
