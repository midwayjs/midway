import { BaseFramework, IMidwayApplication, IMidwayBootstrapOptions, MidwayFrameworkType } from '../src';

type mockApp = {} & IMidwayApplication;
type mockAppOptions = {};

export class MockFramework extends BaseFramework<mockApp, mockAppOptions> {

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

}
