import React, {
  ReactNode, useCallback, useEffect, useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useConnectionContext } from '../../contexts/ConnectionContext';
import { useModalContext } from '../../contexts/ModalContext';

import Button from '../../components/Button';
import Frame from '../../components/Frame';
import Loading from '../../components/Loading';

import Logger from '../../utils/logger';
import { delayAwaitResult } from '../../utils/stdlib';

import styles from './styles.module.scss';

const logger = new Logger({ tag: '[Welcome]' });

const Welcome = () => {
  const navigate = useNavigate();
  const { connector, isOnline } = useConnectionContext();
  const { notice } = useModalContext();
  const [showLoading, setShowLoading] = useState(true);
  const [LoadingMessage, setLoadingMessage] = useState<ReactNode>('Connecting to server');

  const initConnector = useCallback(async () => {
    try {
      await delayAwaitResult(connector.connect(), 1000);
      logger.log(`Connected to server: ${connector.id}`);
      setLoadingMessage(`Connected to server: ${connector.id}`);
      setShowLoading(false);
    } catch (error) {
      notice(`${error}`);
    }
  }, [connector, notice]);

  const handleAsPhotoer = useCallback(() => {
    navigate('/photoer');
  }, [navigate]);

  const handleAsCamera = useCallback(() => {
    navigate('/camera');
  }, [navigate]);

  useEffect(() => {
    initConnector();
  }, [initConnector]);

  return (
    <Frame className={styles.welcome}>
      <Button disabled={!isOnline} onClick={handleAsPhotoer}>
        As Photoer
      </Button>
      <Button disabled={!isOnline} onClick={handleAsCamera}>
        As Camera
      </Button>

      <Loading show={showLoading}>
        {LoadingMessage}
      </Loading>
    </Frame>
  );
};

export default Welcome;
