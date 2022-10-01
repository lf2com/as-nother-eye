import classnames from 'classnames';
import React, {
  createContext, FunctionComponent, PropsWithChildren, Reducer,
  useCallback, useContext, useMemo, useReducer, useState,
} from 'react';

import LogMessage, { LogMessageProps } from './components/LogMessage';

import useLogger, { UseLoggerProps } from './hooks/useLogger';

import styles from './styles.module.scss';

interface LoggerContextProps {
  logger: ReturnType<typeof useLogger>;
  showLog: () => void;
  hideLog: () => void;
}

const LoggerContext = createContext<LoggerContextProps>({
  logger: console,
  showLog: () => {},
  hideLog: () => {},
});

interface LogMessageItem extends LogMessageProps {
  message: string;
}

interface LoggerContextProviderProps {
  tag?: string;
  show?: boolean;
}

const LoggerContextProvider: FunctionComponent<PropsWithChildren<LoggerContextProviderProps>> = ({
  tag,
  show: defaultShow = true,
  children,
}) => {
  const [show, setShow] = useState(defaultShow);

  const [logs, appendLog] = useReducer<Reducer<LogMessageItem[], LogMessageItem>>(
    (prevLogs, log) => prevLogs.concat(log),
    [],
  );

  const className = useMemo(() => (
    classnames(styles.logger, {
      [styles.show]: show,
    })
  ), [show]);

  const onLog = useCallback<Required<UseLoggerProps>['onLog']>((type, ...args) => {
    appendLog({
      type,
      timestamp: Date.now(),
      message: args.map((arg) => `${arg}`).join(' '),
    });
  }, []);

  const logger = useLogger({ tag, onLog });

  const contextValue = useMemo(() => ({
    logger,
    showLog: () => setShow(true),
    hideLog: () => setShow(false),
  }), [logger]);

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
      <div className={className}>
        {logs.map(({ type, timestamp, message }) => (
          <LogMessage
            key={`${type}-${message}-${timestamp}`}
            type={type}
            timestamp={timestamp}
          >
            {message}
          </LogMessage>
        ))}
      </div>
    </LoggerContext.Provider>
  );
};

export const useLoggerContext = () => useContext(LoggerContext);

export default LoggerContextProvider;
