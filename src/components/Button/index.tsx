import classnames from 'classnames';
import React, { ComponentProps, FC } from 'react';

import Clickable from '@/components/Clickable';

import styles from './styles.module.scss';

type ButtonProps = ComponentProps<typeof Clickable>;

const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <Clickable className={classnames(styles.button, className)} {...props} />
);

export default Button;
