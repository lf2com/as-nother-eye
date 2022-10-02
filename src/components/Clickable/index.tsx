import classnames from 'classnames';
import React, { FunctionComponent, MouseEventHandler, PropsWithChildren } from 'react';

import styles from './styles.module.scss';

interface ClickableProps {
  className?: string;
  onClick?: MouseEventHandler;
}

const Clickable: FunctionComponent<PropsWithChildren<ClickableProps>> = ({
  className,
  onClick,
  ...restProps
}) => (
  <span
    className={classnames(styles.clickable, className)}
    onClick={onClick}
    {...restProps}
  />
);

export default Clickable;
