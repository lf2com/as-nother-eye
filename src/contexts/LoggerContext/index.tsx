import classNames from 'classnames';
import type { FC, PropsWithChildren, Reducer } from 'react';
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from 'react';

import Logger from '@/utils/logger';

import type { LogMessageProps } from './components/LogMessage';
import LogMessage from './components/LogMessage';

interface LoggerContextProps {
  logger: Logger;
  showLog: () => void;
  hideLog: () => void;
}

const LoggerContext = createContext<LoggerContextProps>({
  logger: new Logger(),
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

const LoggerContextProvider: FC<
  PropsWithChildren<LoggerContextProviderProps>
> = ({ tag, show: defaultShow = true, children }) => {
  const [show, setShow] = useState(defaultShow);

  const [logs, appendLog] = useReducer<
    Reducer<LogMessageItem[], LogMessageItem>
  >((prevLogs, log) => prevLogs.concat(log), []);

  const logger = useMemo(
    () =>
      new Logger({
        tag,
        onLog: (type, ...args) => {
          appendLog({
            type,
            timestamp: Date.now(),
            message: args.map(arg => `${arg}`).join(' '),
          });
        },
      }),
    [tag]
  );

  const contextValue = useMemo<LoggerContextProps>(
    () => ({
      logger,
      showLog: () => setShow(true),
      hideLog: () => setShow(false),
    }),
    [logger]
  );

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
      <div
        className={classNames(
          'absolute top-0 right-0 bottom-0 left-0 z-[1000] flex flex-col justify-end items-end',
          'opacity-0 pointer-events-none [&>*]:opacity-0 [&>*]:pointer-events-none',
          {
            'opacity-100 [&>*]:pointer-events-auto': show,
          }
        )}
      >
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
