import type { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';

import useCurrRef from '@/hooks/useCurrRef';
import useRenderedEffect from '@/hooks/useRenderedEffect';
import twClassNames from '@/utils/twClassNames';

import type { CloseOverlayFn, OverlayOption } from './types';

interface OverlayProps extends OverlayOption {
  show: boolean;
  onHidden: () => void;
  closeOverlay: CloseOverlayFn<void>;
}

const Overlay: FC<PropsWithChildren<OverlayProps>> = ({
  children,
  show: propShow,
  onHidden,
  closeOverlay,
  onClickOutside,
  outsideThrough: propOutsideThrough,
  closeOnBackdrop = true,
}) => {
  const outsideThrough = !closeOnBackdrop && !!propOutsideThrough;
  const showRef = useCurrRef(propShow);
  const [show, setShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const handleClick = useCallback<MouseEventHandler>(
    e => {
      const isBackdrop = e.currentTarget === e.target;

      if (isBackdrop) {
        onClickOutside?.(e);
      }
      if (!outsideThrough) {
        e.stopPropagation();
      }
      if (closeOnBackdrop && isBackdrop) {
        closeOverlay();
      }
    },
    [closeOnBackdrop, closeOverlay, onClickOutside, outsideThrough]
  );

  const handleAnimationEnd = useCallback(() => {
    if (!showRef.current) {
      onHidden();
    }

    setIsAnimating(false);
  }, [onHidden, showRef]);

  useEffect(() => {
    setIsAnimating(true);
  }, [show]);

  useRenderedEffect(() => {
    setShow(propShow);
  }, [propShow]);

  return (
    <div
      className={twClassNames(
        'absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center',
        'scale-0 pointer-events-none',
        {
          'animate-show pointer-events-auto': show,
          'animate-hide': !show,
          'animate-none': !isAnimating,
        }
      )}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

export default Overlay;
