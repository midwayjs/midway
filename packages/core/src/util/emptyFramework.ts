import { BaseFramework } from '../baseFramework';
import { IMidwayApplication, IMidwayBootstrapOptions } from '../interface';
import { MidwayFrameworkType, Provide, Framework } from '@midwayjs/decorator';

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
@Provide()
@Framework()
export class EmptyFramework extends BaseFramework<any, any, any> {
  logger = noop;
  appLogger = noop;

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.EMPTY;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
  }
}

/**
 * 一个只加载配置的框架
 */
@Provide()
@Framework()
export class ConfigFramework extends BaseFramework<any, any, any> {
  logger = noop;
  appLogger = noop;

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.EMPTY;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }
}

/**
 * 一个全量的空框架
 */
@Provide()
@Framework()
export class LightFramework extends BaseFramework<any, any, any> {
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.LIGHT;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }
}
