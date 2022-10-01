import { useCallback, useMemo } from 'react';

export type LogType = 'debug' | 'log' | 'info' | 'warn' | 'error';

type OnLogFunc = (
  type: LogType,
  ...args: unknown[]
) => void;

export interface UseLoggerProps {
  tag?: string;
  onLog?: OnLogFunc;
}

const { console } = globalThis;

const useLogger = ({
  tag = '',
  onLog,
}: UseLoggerProps) => {
  const handleLog = useCallback<OnLogFunc>((type, ...args) => {
    onLog?.(type, ...args);
    console[type](tag, ...args);
  }, [onLog, tag]);

  const logger = useMemo(() => ({
    debug: handleLog.bind(null, 'debug'),
    log: handleLog.bind(null, 'log'),
    info: handleLog.bind(null, 'info'),
    warn: handleLog.bind(null, 'warn'),
    error: handleLog.bind(null, 'error'),
  }), [handleLog]);

  return logger;
};

export default useLogger;
