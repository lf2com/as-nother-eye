import classnames from 'classnames';
import React, { useMemo } from 'react';

import { LogType } from '@/utils/logger';

import { FCWithChildren } from '@/types/ComponentProps';

import styles from './styles.module.scss';

export interface LogMessageProps {
  type?: LogType;
  timestamp: number;
}

const LogMessage: FCWithChildren<LogMessageProps> = ({
  type = 'log',
  // timestamp,
  children,
}) => {
  const className = useMemo(() => classnames(styles.message, styles[type]), [type]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default React.memo(LogMessage);
