import { ILogger, LoggerOptions } from './interface';
import { MidwayBaseLogger } from './logger';

export class MidwayLoggerContainer extends Map<string, ILogger> {
  createLogger(name: string, options: LoggerOptions = {}): ILogger {
    if (!this.has(name)) {
      const logger = new MidwayBaseLogger(options);
      this.addLogger(name, logger);
      this.set(name, logger);
      return logger;
    }

    return this.getLogger(name);
  }

  addLogger(name: string, logger: ILogger) {
    if (!this.has(name)) {
      if (logger['on']) {
        (logger as any).on('close', () => this.removeLogger(name));
      }
      this.set(name, logger);
    } else {
      throw new Error(`logger id ${name} has duplicate`);
    }
    return logger;
  }

  getLogger(name: string) {
    return this.get(name);
  }

  removeLogger(name: string) {
    this.delete(name);
  }

  /**
   * Closes a `Logger` instance with the specified `name` if it exists.
   * If no `name` is supplied then all Loggers are closed.
   * @param {?string} name - The id of the Logger instance to close.
   * @returns {undefined}
   */
  close(name?: string) {
    if (name) {
      return this.removeLogger(name);
    }

    Array.from(this.keys()).forEach(key => this.removeLogger(key));
  }
}
