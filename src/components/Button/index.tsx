import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import React from 'react';

import Clickable from '@/components/Clickable';

import styles from './styles.module.scss';

type ButtonProps = ComponentProps<typeof Clickable>;

const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <Clickable className={classNames(styles.button, className)} {...props} />
);

export default Button;
