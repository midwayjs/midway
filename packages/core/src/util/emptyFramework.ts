import { BaseFramework } from '../baseFramework';
import { IMidwayApplication, IMidwayBootstrapOptions } from '../interface';
import { MidwayFrameworkType } from '@midwayjs/decorator';

/**
 * 一个不 ready 的空框架
 */
export class EmptyFramework extends BaseFramework<any, any, any> {
  getApplication(): any {
    return this.app;
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.CUSTOM;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }

  getDefaultContextLoggerClass() {
    return super.getDefaultContextLoggerClass();
  }

  async containerReady() {}

  async afterContainerReady() {}
}

/**
 * 一个全量的空框架
 */
export class LightFramework extends BaseFramework<any, any, any> {
  getApplication(): any {
    return this.app;
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.CUSTOM;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }

  getDefaultContextLoggerClass() {
    return super.getDefaultContextLoggerClass();
  }
}
