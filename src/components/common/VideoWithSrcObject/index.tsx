import type { ComponentProps } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';

interface VideoWithSrcObjectProps extends ComponentProps<'video'> {
  srcObject: MediaProvider | null;
}

const VideoWithSrcObject = forwardRef<
  HTMLVideoElement,
  VideoWithSrcObjectProps
>(({ srcObject, ...restProps }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return <video {...restProps} ref={mergeRefs([ref, videoRef])} />;
});

export default VideoWithSrcObject;
