import { FunctionEvent, Runtime } from '../../../src';
import { EggLogger } from 'egg-logger';

export class HttpEvent implements FunctionEvent {
  logger: EggLogger;
  handler;

  constructor(options: { logger }) {
    this.logger = options.logger;
  }

  async create(
    runtime: Runtime,
    handlerFactory: (
      triggerType: string,
      triggerMeta: any
    ) => (arg: any) => Promise<any>
  ) {
    this.handler = handlerFactory('HTTP', { domainName: 'http.test.com' });
    return this.handler;
  }

  transformInvokeArgs(...args): any[] {
    return args;
  }
}
