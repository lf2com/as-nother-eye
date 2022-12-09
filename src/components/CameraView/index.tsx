import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import Clickable from '../Clickable';
import Frame from '../Frame';
import Video from '../Video';

import { FunctionComponentWithClassNameAndChildren } from '../../types/ComponentProps';
import styles from './styles.module.scss';

export interface CameraViewProps {
  majorStream?: MediaStream;
  minorStream?: MediaStream;
  disableShutter?: boolean;
  shutterAnimationId?: number;
  onShutter: () => void | Promise<void>;
  disableSwitchCamera?: boolean;
  onSwitchCamera: () => void | Promise<void>;
}

const CameraView: FunctionComponentWithClassNameAndChildren<CameraViewProps> = ({
  className,
  majorStream,
  minorStream,
  disableShutter: refDisableShutter,
  disableSwitchCamera: refDisableSwitchCamera,
  shutterAnimationId: refShutterAnimationId,
  onShutter,
  onSwitchCamera,
  children,
}) => {
  const [shutterAnimationId, setShutterAnimationId] = useState<number>();
  const [disableShutter, setDisableShutter] = useState<boolean>();
  const [disableSwitchCamera, setDisableSwitchCamera] = useState<boolean>();
  const refMajorVideo = useRef<HTMLVideoElement>(null);

  const handleShutter = useCallback(async () => {
    setDisableShutter(true);
    setShutterAnimationId(Date.now());
    await onShutter?.();
    setDisableShutter(refDisableShutter !== undefined);
  }, [onShutter, refDisableShutter]);

  const onShutterAnimationEnd = () => {
    setShutterAnimationId(undefined);
  };

  const handleSwitchCamera = useCallback(async () => {
    setDisableSwitchCamera(refDisableSwitchCamera ?? true);
    await onSwitchCamera();
    setDisableSwitchCamera(refDisableSwitchCamera !== undefined);
  }, [onSwitchCamera, refDisableSwitchCamera]);

  useEffect(() => {
    const video = refMajorVideo.current;

    if (video) {
      if (shutterAnimationId) {
        video.pause();
      } else {
        video.play();
      }
    }
  }, [shutterAnimationId]);

  useEffect(() => {
    setDisableShutter(refDisableShutter ?? false);
  }, [refDisableShutter]);

  useEffect(() => {
    setDisableSwitchCamera(refDisableSwitchCamera ?? false);
  }, [refDisableSwitchCamera]);

  useEffect(() => {
    if (refShutterAnimationId) {
      setShutterAnimationId(refShutterAnimationId);
    }
  }, [refShutterAnimationId]);

  return (
    <Frame className={classnames(styles['camera-view'], className)}>
      <Frame
        className={classnames(styles.major, {
          [styles['taking-photo']]: !!shutterAnimationId,
        })}
        onAnimationEnd={onShutterAnimationEnd}
      >
        <Video
          ref={refMajorVideo}
          className={styles.video}
          srcObject={majorStream}
        />
      </Frame>
      <Video
        className={styles.minor}
        srcObject={minorStream}
      />

      <Clickable
        disabled={disableShutter}
        className={styles.shutter}
        stopPropagation
        onClick={handleShutter}
      />

      <Clickable
        className={styles['switch-camera']}
        disabled={disableSwitchCamera}
        onClick={handleSwitchCamera}
      >
        <FontAwesomeIcon icon={faCameraRotate} />
      </Clickable>

      {children}
    </Frame>
  );
};

export default CameraView;
