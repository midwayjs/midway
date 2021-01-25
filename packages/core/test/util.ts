import { BaseFramework, IMidwayApplication, IMidwayBootstrapOptions, MidwayFrameworkType, IMidwayContext } from '../src';

type mockApp = {} & IMidwayApplication;
type mockAppOptions = {};
type mockContext = IMidwayContext;

export class MockFramework extends BaseFramework<mockApp, mockContext, mockAppOptions> {

  getApplication(): mockApp {
    return this.app;
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.CUSTOM;
  }

  async run(): Promise<void> {

  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }

  getDefaultContextLoggerClass() {
    return super.getDefaultContextLoggerClass();
  }
}
