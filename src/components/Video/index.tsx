import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useRef } from 'react';

import styles from './styles.module.scss';

interface VideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  srcObject?: MediaStream;
}

const Video: FunctionComponent<VideoProps> = ({
  className,
  srcObject,
  ...restProps
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && srcObject) {
      videoRef.current.srcObject = srcObject;
    }
  }, [videoRef, srcObject]);

  return (
    <div className={classnames(styles.video, className)}>
      <video
        {...restProps}
        ref={videoRef}
        autoPlay
      />
    </div>
  );
};

export default Video;
