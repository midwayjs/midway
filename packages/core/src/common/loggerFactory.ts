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
  private instance: Map<string, ILogger> = new Map();
  createLogger(name: string, options: any): ILogger {
    this.instance.set(name, console);
    return console;
  }
  getLogger(loggerName: string): ILogger {
    return this.instance.get(loggerName);
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

  createContextLogger(ctx: any, appLogger: ILogger, contextOptions?): ILogger {
    return appLogger;
  }

  public getClients() {
    return this.instance;
  }

  public getClientKeys() {
    return Array.from(this.instance.keys());
  }
}
