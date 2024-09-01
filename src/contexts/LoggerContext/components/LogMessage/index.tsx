import classNames from 'classnames';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';

import type { LogType } from '@/utils/logger';

export interface LogMessageProps {
  type?: LogType;
  timestamp: number;
}

const LogMessage: FC<PropsWithChildren<LogMessageProps>> = ({
  type = 'log',
  // timestamp,
  children,
}) => (
  <div
    className={classNames(
      '-mb-px px-[0.5em] py-[0.25em] border-[#eee] border-y bg-transparent text-[#eee] text-[0.8rem] pointer-events-auto',
      {
        'text-[#ccc]': type === 'debug',
        'text-[#eee]': type === 'log',
        'border-[#9cf] bg-[#bce] text-[#03f]': type === 'info',
        'border-[#fec] bg-[#ecb] text-[#630]': type === 'warn',
        'border-[#fdd] bg-[#fee] text-[#f00]': type === 'error',
      }
    )}
  >
    {children}
  </div>
);

export default React.memo(LogMessage);
