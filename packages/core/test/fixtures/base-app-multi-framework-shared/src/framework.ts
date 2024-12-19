import {
  Framework,
  BaseFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
} from '../../../../src';
import { ILogger } from '@midwayjs/logger';

@Framework()
export class LightFramework extends BaseFramework<any, any, any> {
  async run(): Promise<void> {
  }

  configure() {
    return {};
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }

  getFrameworkName(): string {
    return 'grpc';
  }

  getFrameworkLogger(): ILogger {
    return undefined;
  }
}
