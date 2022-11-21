import classnames from 'classnames';
import React, { FunctionComponent, PropsWithChildren, useMemo } from 'react';

import { LogType } from '../../../../utils/logger';

import styles from './styles.module.scss';

export interface LogMessageProps {
  type?: LogType;
  timestamp: number;
}

const LogMessage: FunctionComponent<PropsWithChildren<LogMessageProps>> = ({
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
