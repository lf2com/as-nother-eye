import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, useCallback, useMemo,
} from 'react';

import styles from './styles.module.scss';

interface ClickableProps {
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler;
  stopPropagation?: boolean;
}

const Clickable: FunctionComponent<PropsWithChildren<ClickableProps>> = ({
  disabled = false,
  className,
  onClick,
  stopPropagation,
  ...restProps
}) => {
  const finalClassName = useMemo(() => classnames(
    styles.clickable,
    { disabled },
    className,
  ), [className, disabled]);

  const handleClick = useCallback<MouseEventHandler>((event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (!disabled) {
      onClick?.(event);
    }
  }, [disabled, onClick, stopPropagation]);

  return (
    <span
      className={finalClassName}
      onClick={handleClick}
      {...restProps}
    />
  );
};

export default Clickable;
