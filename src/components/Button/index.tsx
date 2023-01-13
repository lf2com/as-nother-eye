import classnames from 'classnames';
import React, { FC } from 'react';

import Clickable from '@/components/Clickable';

import styles from './styles.module.scss';

type ButtonProps = Parameters<typeof Clickable>[0];

const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <Clickable className={classnames(styles.button, className)} {...props} />
);

export default Button;
