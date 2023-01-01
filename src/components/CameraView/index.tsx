import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import React, {
  ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';

import Clickable from '@/components/Clickable';
import Frame from '@/components/Frame';
import Video from '@/components/Video';

import { FunctionComponentWithClassNameAndChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

export interface CameraViewProps {
  majorClassName?: string;
  majorContent?: MediaStream | ReactNode;
  minorContent?: MediaStream | ReactNode;
  disableShutter?: boolean;
  shutterAnimationId?: number;
  disableSwitchCamera?: boolean;
  onShutter: () => void | Promise<void>;
  onSwitchCamera: () => void | Promise<void>;
  onClickMajor?: () => void | Promise<void>;
  onClickMinor?: () => void | Promise<void>;
}

const CameraView: FunctionComponentWithClassNameAndChildren<CameraViewProps> = ({
  className,
  majorContent = null,
  minorContent = null,
  disableShutter: refDisableShutter,
  disableSwitchCamera: refDisableSwitchCamera,
  shutterAnimationId: refShutterAnimationId,
  onShutter,
  onSwitchCamera,
  onClickMajor,
  onClickMinor,
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
      <Clickable
        className={classnames(styles.major, {
          [styles['taking-photo']]: !!shutterAnimationId,
        })}
        onAnimationEnd={onShutterAnimationEnd}
        disabled={!onClickMajor}
        onClick={onClickMajor}
      >
        {(majorContent instanceof MediaStream
          ? (
            <Video
              ref={refMajorVideo}
              className={styles.video}
              srcObject={majorContent}
            />
          )
          : majorContent
        )}
      </Clickable>

      <Clickable
        className={styles.minor}
        disabled={!onClickMinor}
        onClick={onClickMinor}
      >
        {(minorContent instanceof MediaStream
          ? <Video srcObject={minorContent} />
          : minorContent
        )}
      </Clickable>

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
