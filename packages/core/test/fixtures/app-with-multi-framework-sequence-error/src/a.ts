import {
  Configuration as CoreConfiguration,
  BaseFramework,
  Framework,
  IMidwayBootstrapOptions,
  IMidwayApplication,
  destroyGlobalApplicationContext
} from '../../../../src';

@Framework()
export class AFramework extends BaseFramework<any, any, any> {
  private isStopped = false;

  async run(): Promise<void> {
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }

  async beforeStop() {
    if (!this.isStopped) {
      this.isStopped = true;
      await destroyGlobalApplicationContext(this.applicationContext);
    }
  }

  configure() {
    return {};
  }
}

@CoreConfiguration({
  namespace: 'a',
})
export class Configuration {
}
