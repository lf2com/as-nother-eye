import classNames from 'classnames';
import React, {
  ComponentProps, forwardRef, RefCallback, useCallback,
} from 'react';

import styles from './styles.module.scss';

interface VideoProps extends ComponentProps<'video'> {
  srcObject?: MediaStream;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(({
  className,
  srcObject,
  ...restProps
}, ref) => {
  const hasContent = !!srcObject;

  const handleRef = useCallback<RefCallback<HTMLVideoElement>>((node) => {
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
  }, [ref, srcObject]);

  return (
    <div className={classNames(styles.video, className, {
      [styles.show]: hasContent,
    })}>
      <video
        {...restProps}
        ref={handleRef}
        autoPlay
      />
    </div>
  );
});

export default Video;
