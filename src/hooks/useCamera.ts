import { useCallback, useState } from 'react';

type CameraConstraints = Parameters<MediaDevices['getUserMedia']>[0];

const useCamera = () => {
  const [stream, setStream] = useState<MediaStream>();
  const [error, setError] = useState<Error>();

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, [stream]);

  const start = useCallback(async (conf: CameraConstraints) => {
    stop();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(conf);

      setStream(mediaStream);

      return mediaStream;
    } catch (err) {
      setError(err as Error);

      throw err;
    }
  }, [stop]);

  return {
    stream, error, start, stop,
  };
};

export default useCamera;
