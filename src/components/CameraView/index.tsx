import type { FC, PropsWithChildren, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Clickable from '@/components/Clickable';
import Video from '@/components/Video';
import type { FlipCameraCommand } from '@/contexts/ConnectionContext/Command';
import twClassNames from '@/utils/twClassNames';
import {
  faArrowsLeftRight,
  faArrowsUpDown,
  faCameraRotate,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
  className?: string;
}

const CameraView: FC<PropsWithChildren<CameraViewProps>> = ({
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

  const handleFlipCamera = useCallback(
    async (direction: FlipCameraCommand['param']) => {
      setDisableFlipCamera(refDisableFlipCamera ?? true);
      await onFlipCamera(direction);
      setDisableFlipCamera(refDisableFlipCamera !== undefined);
    },
    [onFlipCamera, refDisableFlipCamera]
  );

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
    <div
      className={twClassNames(
        'relative w-full h-full text-[1rem] grid grid-areas-[major,shutter] grid-rows-[1fr_auto]',
        'bg-black',
        className
      )}
    >
      <Clickable
        className={twClassNames(
          'relative w-full h-full grid-in-[major] block',
          {
            'animate-shot': !!shutterAnimationId,
            'text-[0.8rem] flex justify-center items-center': !(
              majorContent instanceof MediaStream
            ),
            'cursor-default': !onClickMajor,
          }
        )}
        onAnimationEnd={onShutterAnimationEnd}
        disabled={!onClickMajor}
        onClick={onClickMajor}
      >
        {majorContent instanceof MediaStream && (
          <>
            <Video
              ref={refMajorVideo}
              className="absolute"
              srcObject={majorContent}
            />
            <div
              className={twClassNames(
                'absolute box-border border-white pointer-events-none z-[1]',
                '-translate-y-1/2 top-1/2 w-full h-[calc(100%/3)] border-y'
              )}
            />
            <div
              className={twClassNames(
                'absolute box-border border-white pointer-events-none z-[1]',
                '-translate-x-1/2 left-1/2 w-[calc(100%/3)] h-full border-x'
              )}
            />
          </>
        )}
      </Clickable>

      <Clickable
        className={twClassNames(
          'absolute right-0 bottom-0 m-[0.5rem] max-w-[30%] max-h-[30%] w-full h-full',
          'border border-white outline outline-1 outline-black bg-inherit block',
          {
            'text-[0.8rem] flex justify-center items-center': !(
              minorContent instanceof MediaStream
            ),
            'cursor-default': !onClickMinor,
          }
        )}
        disabled={!onClickMinor}
        onClick={onClickMinor}
      >
        {minorContent instanceof MediaStream && (
          <Video srcObject={minorContent} />
        )}
      </Clickable>

      <Clickable
        disabled={disableShutter}
        className={twClassNames(
          'm-[1em] left-1/2 p-[0.5em] w-[20vmin] h-[20vmin] box-border',
          'rounded-50% border-[0.2em] border-current bg-current bg-clip-content',
          'text-white grid-in-[shutter] justify-self-center',
          { 'text-[#ccc]': disableShutter }
        )}
        stopPropagation
        onClick={handleShutter}
      />

      <Clickable
        className={twClassNames(
          'absolute bottom-0 left-0 m-[0.25em] text-white text-[3em]',
          { 'text-[#ccc]': disableSwitchCamera }
        )}
        disabled={disableSwitchCamera}
        onClick={handleSwitchCamera}
      >
        <FontAwesomeIcon icon={faCameraRotate} />
      </Clickable>

      <div
        className={twClassNames(
          'absolute top-0 right-0 my-[0.25em] mx-[0.5em] text-[1.5em] text-black',
          'drop-shadow-white z-10 flex gap-[0.5em]'
        )}
      >
        <Clickable
          disabled={disableFlipCamera}
          className={twClassNames({ 'text-[#999]': disableFlipCamera })}
          onClick={flipCameraVertical}
        >
          <FontAwesomeIcon icon={faArrowsUpDown} />
        </Clickable>

        <Clickable
          disabled={disableFlipCamera}
          className={twClassNames({ 'text-[#999]': disableFlipCamera })}
          onClick={flipCameraHorizontal}
        >
          <FontAwesomeIcon icon={faArrowsLeftRight} />
        </Clickable>
      </div>

      {children}
    </div>
  );
};

export default CameraView;
