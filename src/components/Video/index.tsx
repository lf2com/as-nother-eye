import classNames from 'classnames';
import type { ComponentProps, RefCallback } from 'react';
import React, { forwardRef, useCallback } from 'react';

import twClassNames from '@/utils/twClassNames';

interface VideoProps extends ComponentProps<'video'> {
  srcObject?: MediaStream;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(
  ({ className, srcObject, ...restProps }, ref) => {
    const hasContent = !!srcObject;

    const handleRef = useCallback<RefCallback<HTMLVideoElement>>(
      node => {
        if (node) {
          if (srcObject) {
            node.srcObject = srcObject;
          }
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }
      },
      [ref, srcObject]
    );

    return (
      <div
        className={classNames(
          'relative w-full h-full box-border bg-[#999] overflow-hidden',
          className
        )}
      >
        <video
          {...restProps}
          ref={handleRef}
          className={twClassNames(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full bg-[#999] pointer-events-none',
            { hidden: !hasContent }
          )}
          autoPlay
        />
      </div>
    );
  }
);

export default Video;
