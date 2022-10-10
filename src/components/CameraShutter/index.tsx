import classnames from 'classnames';
import React, { FunctionComponent, PropsWithChildren } from 'react';

import Clickable from '../Clickable';

import styles from './styles.module.scss';

interface ShutterProps {
  className?: string;
  disabled?: boolean;
  onShot?: () => void;
}

const Shutter: FunctionComponent<PropsWithChildren<ShutterProps>> = ({
  className,
  onShot,
  disabled = false,
}) => (
  <Clickable
    disabled={disabled}
    className={classnames(styles.shutter, className)}
    stopPropagation
    onClick={onShot}
  />
);

export default Shutter;
