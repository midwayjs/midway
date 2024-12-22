import { BaseFramework, Framework, IMidwayBootstrapOptions } from '../../../../src';

@Framework()
export class CustomFramework extends BaseFramework<any, any, any> {
  frameworkLoggerName = 'customFrameworkLogger';
  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {};
  }

  configure(options: any) {
    return this.configService.getConfiguration('custom');
  }

  run(): Promise<void> {
    this.logger.info('run custom framework');
    return Promise.resolve(undefined);
  }
}
