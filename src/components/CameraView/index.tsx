import { faArrowsLeftRight, faArrowsUpDown, faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, {
  ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';

import { FlipCameraCommand } from '@/contexts/ConnectionContext/Command';

import Clickable from '@/components/Clickable';
import Frame from '@/components/Frame';
import Video from '@/components/Video';

import { FCWithClassNameAndChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

export interface CameraViewProps {
  majorClassName?: string;
  majorContent?: MediaStream | ReactNode;
  minorContent?: MediaStream | ReactNode;
  disableShutter?: boolean;
  shutterAnimationId?: number;
  disableSwitchCamera?: boolean;
  disableFlipCamera?: boolean;
  onShutter: () => void | Promise<void>;
  onSwitchCamera: () => void | Promise<void>;
  onFlipCamera: (direction: FlipCameraCommand['param']) => void | Promise<void>;
  onClickMajor?: () => void | Promise<void>;
  onClickMinor?: () => void | Promise<void>;
}

const CameraView: FCWithClassNameAndChildren<CameraViewProps> = ({
  className,
  majorContent = null,
  minorContent = null,
  disableShutter: refDisableShutter,
  disableSwitchCamera: refDisableSwitchCamera,
  disableFlipCamera: refDisableFlipCamera,
  shutterAnimationId: refShutterAnimationId,
  onShutter,
  onSwitchCamera,
  onFlipCamera,
  onClickMajor,
  onClickMinor,
  children,
}) => {
  const [shutterAnimationId, setShutterAnimationId] = useState<number>();
  const [disableShutter, setDisableShutter] = useState<boolean>();
  const [disableSwitchCamera, setDisableSwitchCamera] = useState<boolean>();
  const [disableFlipCamera, setDisableFlipCamera] = useState<boolean>();
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

  const handleFlipCamera = useCallback(async (direction: FlipCameraCommand['param']) => {
    setDisableFlipCamera(refDisableFlipCamera ?? true);
    await onFlipCamera(direction);
    setDisableFlipCamera(refDisableFlipCamera !== undefined);
  }, [onFlipCamera, refDisableFlipCamera]);

  const flipCameraHorizontal = () => handleFlipCamera('horizontal');
  const flipCameraVertical = () => handleFlipCamera('vertical');

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
    setDisableFlipCamera(refDisableFlipCamera ?? false);
  }, [refDisableFlipCamera]);

  useEffect(() => {
    if (refShutterAnimationId) {
      setShutterAnimationId(refShutterAnimationId);
    }
  }, [refShutterAnimationId]);

  return (
    <Frame className={classNames(styles['camera-view'], className)}>
      <Clickable
        className={classNames(styles.major, {
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

      <div className={styles['flip-camera-tool']}>
        <Clickable
          disabled={disableFlipCamera}
          onClick={flipCameraVertical}
        >
          <FontAwesomeIcon icon={faArrowsUpDown} />
        </Clickable>

        <Clickable
          disabled={disableFlipCamera}
          onClick={flipCameraHorizontal}
        >
          <FontAwesomeIcon icon={faArrowsLeftRight} />
        </Clickable>
      </div>

      {children}
    </Frame>
  );
};

export default CameraView;
