import type { ComponentProps, FC } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import Clickable from '../Clickable';

interface LongPressProps extends ComponentProps<typeof Clickable> {
  onLongPress: () => void;
  interval?: number;
}

type RequiredProps = Required<LongPressProps>;

const LongPress: FC<LongPressProps> = ({
  interval = 500,
  onLongPress,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onContextMenu,
  ...restProps
}) => {
  const timeoutIdRef = useRef(-1);
  const cancel = useCallback(() => {
    clearTimeout(timeoutIdRef.current);
  }, []);

  const handlePointerDown = useCallback<RequiredProps['onPointerDown']>(
    e => {
      onPointerDown?.(e);
      timeoutIdRef.current = setTimeout(() => {
        onLongPress();
      }, interval);
    },
    [interval, onLongPress, onPointerDown]
  );

  const handlePointerUp = useCallback<RequiredProps['onPointerUp']>(
    e => {
      cancel();
      onPointerUp?.(e);
    },
    [cancel, onPointerUp]
  );

  const handlePointerCancel = useCallback<RequiredProps['onPointerCancel']>(
    e => {
      cancel();
      onPointerCancel?.(e);
    },
    [cancel, onPointerCancel]
  );

  const handleContextMenu = useCallback<RequiredProps['onContextMenu']>(
    e => {
      onContextMenu?.(e);
      onLongPress();
    },
    [onContextMenu, onLongPress]
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return (
    <Clickable
      {...restProps}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={handleContextMenu}
    />
  );
};

export default LongPress;
