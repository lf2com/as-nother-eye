import classnames from 'classnames';
import React, {
  FunctionComponent, PropsWithChildren, useCallback, useMemo,
} from 'react';

import Button from '../Button';

import styles from './styles.module.scss';

type ShareData = Required<Parameters<Navigator['canShare']>>[0];

interface ShareButtonProps extends ShareData {
  className?: string;
  disabled?: boolean;
  onShared?: () => void;
}

const ShareButton: FunctionComponent<PropsWithChildren<ShareButtonProps>> = ({
  className,
  title,
  text,
  url,
  files,
  onShared,
  children,
  disabled = false,
}) => {
  const shareData = useMemo<ShareData>(() => ({
    title, text, url, files,
  }), [files, text, title, url]);

  const canShare = useMemo(() => (
    !disabled && navigator.canShare(shareData)
  ), [disabled, shareData]);

  const onClick = useCallback(async () => {
    await navigator.share(shareData);
    onShared?.();
  }, [onShared, shareData]);

  return (
    <Button
      className={classnames(styles['share-button'], className)}
      disabled={!canShare}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default ShareButton;
