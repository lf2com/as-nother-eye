import React, {
  FunctionComponent, ReactEventHandler, useCallback, useEffect, useRef,
} from 'react';

import styles from './styles.module.scss';

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  srcObject?: MediaStream;
}

const Video: FunctionComponent<VideoProps> = ({
  srcObject,
  onLoadedMetadata,
  ...restProps
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = useCallback<ReactEventHandler<HTMLVideoElement>>((event) => {
    onLoadedMetadata?.(event);

    if (event.isDefaultPrevented() || event.isPropagationStopped()) {
      return;
    }

    videoRef.current?.play();
  }, [onLoadedMetadata]);

  useEffect(() => {
    if (videoRef.current && srcObject) {
      videoRef.current.srcObject = srcObject;
    }
  }, [videoRef, srcObject]);

  return (
    <video
      {...restProps}
      ref={videoRef}
      className={styles.video}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
};

export default Video;
