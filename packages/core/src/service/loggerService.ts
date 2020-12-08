import { ILoggerService } from '../interface';
import { ILogger, LoggerOptions } from '@midwayjs/logger';
import { createMidwayLogger } from '../logger';

export class MidwayLoggerService
  extends Map<string, ILogger>
  implements ILoggerService {
  container;
  constructor(container) {
    super();
    this.container = container;
  }

  createLogger(loggerId: string, options: LoggerOptions = {}): ILogger {
    if (!this.has(loggerId)) {
      const logger = createMidwayLogger(this.container, options);
      this.addLogger(loggerId, logger);
      this.set(loggerId, logger);
      return logger;
    }

    return this.getLogger(loggerId);
  }

  addLogger(loggerId: string, logger: ILogger) {
    if (!this.has(loggerId)) {
      if(logger['on']) {
        (logger as any).on('close', () => this.removeLogger(loggerId));
      }
      this.set(loggerId, logger);
    } else {
      throw new Error(`logger id ${loggerId} has duplicate`);
    }
    return logger;
  }

  getLogger(loggerId: string) {
    if (this.has(loggerId)) {
      return this.get(loggerId);
    }
    return this.get('default');
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
