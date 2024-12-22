import { useEffect, useState } from 'react';

import useCurrRef from './useCurrRef';

interface Options {
  flipX?: boolean;
  flipY?: boolean;
}

const useStream = (
  stream: MediaStream | null,
  { flipX = false, flipY = false }: Options = {}
) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const flipXRef = useCurrRef(flipX);
  const flipYRef = useCurrRef(flipY);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');

    let aborted = false;

    video.autoplay = true;
    video.muted = true;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      const drawNextFrame = () => {
        if (aborted) {
          return;
        }

        const { width, height } = canvas;

        ctx.save();

        if (flipXRef.current) {
          ctx.transform(-1, 0, 0, 1, width, 0);
        }
        if (flipYRef.current) {
          ctx.transform(1, 0, 0, -1, 0, height);
        }

        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
        requestAnimationFrame(drawNextFrame);
      };

      drawNextFrame();
      setVideoStream(canvas.captureStream());
      setCanvas(canvas);
    });

    [video, canvas].forEach(node => {
      node.style.pointerEvents = 'none';
      node.style.position = 'fixed';
      node.style.top = '0';
      node.style.opacity = '0';
      document.body.append(node);
    });

    return () => {
      aborted = true;
      [video, canvas].forEach(node => node.remove());
    };
  }, [flipXRef, flipYRef, stream]);

  return {
    canvas,
    stream: videoStream,
  };
};

export default useStream;
