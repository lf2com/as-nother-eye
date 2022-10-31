import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import Clickable from '../Clickable';

import styles from './styles.module.scss';

type ButtonProps = Parameters<typeof Clickable>[0];

const Button: FunctionComponent<ButtonProps> = ({ className, ...props }) => (
  <Clickable className={classnames(styles.button, className)} {...props} />
);

export default Button;
