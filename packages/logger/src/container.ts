import { ILogger, LoggerOptions } from './interface';
import { MidwayBaseLogger } from './logger';

export class MidwayLoggerContainer extends Map<string, ILogger> {
  createLogger(loggerId: string, options: LoggerOptions = {}): ILogger {
    if (!this.has(loggerId)) {
      const logger = new MidwayBaseLogger(options);
      this.addLogger(loggerId, logger);
      this.set(loggerId, logger);
      return logger;
    }

    return this.getLogger(loggerId);
  }

  addLogger(loggerId: string, logger: ILogger) {
    if (!this.has(loggerId)) {
      if (logger['on']) {
        (logger as any).on('close', () => this.removeLogger(loggerId));
      }
      this.set(loggerId, logger);
    } else {
      throw new Error(`logger id ${loggerId} has duplicate`);
    }
    return logger;
  }

  getLogger(loggerId: string) {
    return this.get(loggerId);
  }

  removeLogger(loggerId: string) {
    this.delete(loggerId);
  }

  /**
   * Closes a `Logger` instance with the specified `id` if it exists.
   * If no `id` is supplied then all Loggers are closed.
   * @param {?string} id - The id of the Logger instance to close.
   * @returns {undefined}
   */
  close(id?: string) {
    if (id) {
      return this.removeLogger(id);
    }

    Array.from(this.keys()).forEach(key => this.removeLogger(key));
  }
}
