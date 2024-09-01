export type LogType = 'debug' | 'log' | 'info' | 'warn' | 'error';

type OnLogFunc = (type: LogType, ...args: unknown[]) => void;

interface LoggerOptions {
  tag?: string;
  onLog?: OnLogFunc;
}

const { console } = globalThis;

class Logger {
  protected onLog: OnLogFunc;

  tag: string;

  constructor(props: LoggerOptions = {}) {
    const { tag = '', onLog = () => {} } = props;

    this.tag = tag;
    this.onLog = onLog;
  }

  protected handleLog: OnLogFunc = (type, ...args) => {
    this.onLog(type, ...args);

    if (this.tag.length > 0) {
      args.unshift(this.tag);
    }

    console[type](...args);
  };

  debug = this.handleLog.bind(null, 'debug');

  log = this.handleLog.bind(null, 'log');

  info = this.handleLog.bind(null, 'info');

  warn = this.handleLog.bind(null, 'warn');

  error = this.handleLog.bind(null, 'error');
}

export default Logger;
