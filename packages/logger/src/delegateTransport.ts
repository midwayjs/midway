import * as Transport from 'winston-transport';
import { ILogger } from './interface';

export interface DelegateTransportOptions {
  delegateLogger: ILogger;
}

export class DelegateTransport extends Transport {
  options;
  constructor(options: DelegateTransportOptions) {
    super();
    this.options = options;
  }

  log(info, callback) {
    this.options.delegateLogger[info.level]?.call(
      this.options.delegateLogger,
      info.message
    );
    callback();
  }
}
