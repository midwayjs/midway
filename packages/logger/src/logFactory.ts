import { ILogFactory, ILogger } from './interface';

export class LogFactory<T> implements ILogFactory {
  static getInstance(): ILogFactory {
    return new LogFactory();
  }

  static getLogger(options: any): ILogger {
    return this.getInstance().createLogger(options);
  }

  createLogger(options: T): ILogger {
    return undefined;
  }
}
