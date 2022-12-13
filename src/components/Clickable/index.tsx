import classnames from 'classnames';
import React, {
  AllHTMLAttributes, MouseEventHandler, useCallback, useMemo,
} from 'react';

import { FunctionComponentWithClassNameAndChildren } from '../../types/ComponentProps';
import styles from './styles.module.scss';

interface ClickableProps extends AllHTMLAttributes<HTMLSpanElement> {
  disabled?: boolean;
  stopPropagation?: boolean;
}

const Clickable: FunctionComponentWithClassNameAndChildren<ClickableProps> = ({
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
