import classNames from 'classnames';
import React from 'react';

import type { FCWithChildren } from '@/types/ComponentProps';
import type { LogType } from '@/utils/logger';

import styles from './styles.module.scss';

export interface LogMessageProps {
  type?: LogType;
  timestamp: number;
}

const LogMessage: FCWithChildren<LogMessageProps> = ({
  type = 'log',
  // timestamp,
  children,
}) => (
  <div className={classNames(styles.message, styles[type])}>{children}</div>
);

export default React.memo(LogMessage);
