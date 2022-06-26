import { FunctionEvent } from '../../../src';

export class HttpEvent implements FunctionEvent {
  type: string;
  meta: object;
  logger;

  constructor(options) {
    this.type = 'HTTP';
    this.meta = { domainName: 'http.test.com' };
    this.logger = options.logger;
  }

  match() {
    return true;
  }

  transformInvokeArgs(...args): any[] {
    return args;
  }
}
