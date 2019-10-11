import * as mock from 'egg-mock';
import { resolveModule } from 'midway-bin';

import { MidwayApplicationOptions, MidwayMockApplication } from './interface';

export interface MidwayMock extends mock.EggMock {
  container: typeof mockContainer;
  default: mock.EggMock;
  app: (option?: MidwayApplicationOptions) => MidwayMockApplication;
  cluster: (option?: MidwayApplicationOptions) => MidwayMockApplication;
  // [prop: string]: any
}

/**
 * 只初始化app级别的container
 * agent相关的逻辑使用mm2.app
 * @param options 参数
 */
function mockContainer(options: MidwayApplicationOptions): MockContainer {
  return new MockContainer(options);
}

const defaultFramework: string = resolveModule('midway') || resolveModule('midway-mirror');

export const mm = Object.assign({}, mock, {
  container: mockContainer,
}) as MidwayMock;

mm.app = (options): MidwayMockApplication => {
  if (process.env.MIDWAY_BASE_DIR && !options.baseDir) { options.baseDir = process.env.MIDWAY_BASE_DIR; }
  if (process.env.MIDWAY_FRAMEWORK_PATH && !options.framework) { options.framework = process.env.MIDWAY_FRAMEWORK_PATH; }
  // @ts-ignore
  return mock.app(Object.assign({
    framework: options.framework || defaultFramework,
    typescript: !!require.extensions['.ts'],
  }, options));
};

mm.cluster = (options) => {
  if (process.env.MIDWAY_BASE_DIR && !options.baseDir) { options.baseDir = process.env.MIDWAY_BASE_DIR; }
  if (process.env.MIDWAY_FRAMEWORK_PATH && !options.framework) { options.framework = process.env.MIDWAY_FRAMEWORK_PATH; }
  // @ts-ignore
  return mock.cluster(Object.assign({
    framework: options.framework || defaultFramework,
    typescript: !!require.extensions['.ts'],
  }, options));
};

export class MockContainer {

  app: MidwayMockApplication;

  constructor(options: MidwayApplicationOptions) {
    this.app = mm.app(options);
  }

  async ready() {
    await this.app.ready();
  }

  async getAsync(id: any) {
    return this.app.applicationContext.getAsync(id);
  }

  get(id: any) {
    return this.app.applicationContext.get(id);
  }
}
