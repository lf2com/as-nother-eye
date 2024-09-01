import classNames from 'classnames';
import type {
  ComponentProps,
  FC,
  MouseEventHandler,
  PropsWithChildren,
} from 'react';
import React, { useCallback } from 'react';

interface ClickableProps extends ComponentProps<'span'> {
  disabled?: boolean;
  stopPropagation?: boolean;
}

const Clickable: FC<PropsWithChildren<ClickableProps>> = ({
  disabled = false,
  className,
  onClick,
  stopPropagation,
  ...restProps
}) => {
  const handleClick = useCallback<MouseEventHandler<HTMLSpanElement>>(
    event => {
      if (stopPropagation) {
        event.stopPropagation();
      }
      if (!disabled) {
        onClick?.(event);
      }
    },
    [disabled, onClick, stopPropagation]
  );

  return (
    <span
      className={classNames(
        '[-webkit-tap-highlight-color:transparent] select-none bg-black/0 cursor-pointer z-[1]',
        {
          'cursor-not-allowed': disabled,
          'active:brightness-90': !disabled,
        },
        className
      )}
      onClick={handleClick}
      {...restProps}
    />
  );
};

export default Clickable;
