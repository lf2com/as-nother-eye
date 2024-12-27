import { useCallback, useEffect, useMemo, useState } from 'react';

import useMount from './useMount';

const useCamera = () => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const camera = useMemo<MediaDeviceInfo | null>(
    () => cameras[cameraIndex] ?? null,
    [cameraIndex, cameras]
  );

  const switchCamera = useCallback(() => {
    setCameraIndex(prevIndex => (prevIndex + 1) % cameras.length);
  }, [cameras.length]);

  useMount(() => {
    const init = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const realCameras = devices.filter(
        ({ kind, label }) =>
          kind === 'videoinput' && !/\bvirtual\b/i.test(label)
      );

      setCameras(realCameras);
    };

    init();
  });

  useEffect(() => {
    if (!camera) {
      return;
    }

    let aborted = false;

    const init = async () => {
      const { deviceId } = camera;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId,
          focusMode: 'continuous',
        },
      });

      if (!aborted) {
        setStream(stream);
      }
    };

    init();

    return () => {
      aborted = true;
      setStream(null);
    };
  }, [camera]);

  return {
    switchCamera,
    stream,
    camera,
  };
};

export default useCamera;
