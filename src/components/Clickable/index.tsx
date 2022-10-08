import classnames from 'classnames';
import React, {
  FunctionComponent, MouseEventHandler, PropsWithChildren, useCallback,
} from 'react';

import styles from './styles.module.scss';

interface ClickableProps {
  className?: string;
  onClick?: MouseEventHandler;
  stopPropagation?: boolean;
}

const Clickable: FunctionComponent<PropsWithChildren<ClickableProps>> = ({
  className,
  onClick,
  stopPropagation,
  ...restProps
}) => {
  const handleClick = useCallback<MouseEventHandler>((event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    onClick?.(event);
  }, [onClick, stopPropagation]);

  return (
    <span
      className={classnames(styles.clickable, className)}
      onClick={handleClick}
      {...restProps}
    />
  );
};

export default Clickable;
