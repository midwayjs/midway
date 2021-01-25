import TransportStream = require('winston-transport');
import { ILogger } from './interface';

export interface DelegateTransportOptions {
  delegateLogger: ILogger;
}

export class DelegateTransport extends TransportStream {
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

export class EmptyTransport extends TransportStream {
  log(info, callback) {
    callback();
  }
}
