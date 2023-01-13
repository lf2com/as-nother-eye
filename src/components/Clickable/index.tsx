import classnames from 'classnames';
import React, {
  ComponentProps, MouseEventHandler, useCallback, useMemo,
} from 'react';

import { FCWithClassNameAndChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

interface ClickableProps extends ComponentProps<'span'> {
  disabled?: boolean;
  stopPropagation?: boolean;
}

const Clickable: FCWithClassNameAndChildren<ClickableProps> = ({
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

  const handleClick = useCallback<MouseEventHandler<HTMLSpanElement>>((event) => {
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
