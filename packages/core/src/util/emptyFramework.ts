import { BaseFramework } from '../baseFramework';
import { IMidwayApplication, IMidwayBootstrapOptions, MidwayFrameworkType } from '../interface';

export class EmptyFramework extends BaseFramework<any, any, any> {

  getApplication(): any {
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
