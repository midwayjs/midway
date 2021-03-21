import { BaseFramework } from '../baseFramework';
import { IMidwayApplication, IMidwayBootstrapOptions } from '../interface';
import { MidwayFrameworkType } from '@midwayjs/decorator';

const noop = {
  info() {},
  warn() {},
  error() {},
  debug() {},
  write() {},
};

/**
 * 一个不 ready 的空框架
 */
export class EmptyFramework extends BaseFramework<any, any, any> {
  logger = noop;
  appLogger = noop;
  getApplication(): any {
    return this.app;
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.EMPTY;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }

  async containerReady() {}

  async afterContainerReady() {}
}

/**
 * 一个只加载配置的框架
 */
export class ConfigFramework extends BaseFramework<any, any, any> {
  logger = noop;
  appLogger = noop;
  getApplication(): any {
    return this.app;
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.EMPTY;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }

  async containerReady() {
    await this.applicationContext.ready();
    if (this.applicationContext.getConfigService()) {
      // 加载配置
      await this.applicationContext.getConfigService().load();
    }
  }

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
    return MidwayFrameworkType.LIGHT;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }
}
