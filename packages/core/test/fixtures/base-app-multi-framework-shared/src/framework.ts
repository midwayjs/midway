import {
  Framework,
  BaseFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
} from '../../../../src';

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
}
