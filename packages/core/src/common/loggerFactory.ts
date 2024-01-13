import { ILogger, MidwayAppInfo } from '../interface';

export abstract class LoggerFactory<Logger extends ILogger, LoggerOptions> {
  abstract createLogger(name: string, options: LoggerOptions): Logger;
  abstract getLogger(loggerName: string): Logger;
  abstract close(loggerName?: string);
  abstract removeLogger(loggerName: string);
  abstract getDefaultMidwayLoggerConfig(appInfo: MidwayAppInfo): {
    midwayLogger: {
      default?: LoggerOptions;
      clients?: {
        [loggerName: string]: LoggerOptions;
      };
    };
  };
  abstract createContextLogger(
    ctx: any,
    appLogger: ILogger,
    contextOptions?: any
  ): ILogger;
}

export class DefaultConsoleLoggerFactory
  implements LoggerFactory<ILogger, any>
{
  createLogger(name: string, options: any): ILogger {
    return console;
  }
  getLogger(loggerName: string): ILogger {
    return console;
  }
  close(loggerName?: string) {}
  removeLogger(loggerName: string) {}

  getDefaultMidwayLoggerConfig(): {
    midwayLogger: { default?: any; clients?: { [p: string]: any } };
  } {
    return {
      midwayLogger: {
        default: {},
        clients: {
          coreLogger: {},
          appLogger: {},
        },
      },
    };
  }

  createContextLogger(ctx: any, appLogger: ILogger): ILogger {
    return appLogger;
  }
}
