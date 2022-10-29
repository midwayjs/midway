import { ILogger } from '../interface';

export abstract class LoggerFactory<Logger extends ILogger, LoggerOptions> {
  abstract createLogger(name: string, options: LoggerOptions): Logger;
  abstract getLogger(loggerName: string): Logger;
  abstract close(loggerName?: string);
  abstract removeLogger(loggerName: string);
}
