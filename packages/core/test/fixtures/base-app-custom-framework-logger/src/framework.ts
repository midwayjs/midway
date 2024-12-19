import { BaseFramework, Framework, IMidwayBootstrapOptions } from '../../../../src';
import { ILogger } from '@midwayjs/logger';

@Framework()
export class CustomFramework extends BaseFramework<any, any, any> {
  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {};
  }

  configure(options: any) {
    return this.configService.getConfiguration('custom');
  }

  run(): Promise<void> {
    this.app.getCoreLogger().info('run custom framework');
    return Promise.resolve(undefined);
  }

  getFrameworkLogger(): ILogger {
    return this.loggerService.getLogger('customFrameworkLogger');
  }
}
