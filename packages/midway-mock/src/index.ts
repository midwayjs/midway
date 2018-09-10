import { EggMock } from 'egg-mock';
import { MidwayApplicationOptions } from './interface';

const mock = require('egg-mock');

export interface MidwayMock extends EggMock {
  container: typeof mockContainer;
  default: typeof mock;
}

/**
 * 只初始化app级别的container
 * agent相关的逻辑使用mm2.app
 * @param options 参数
 */
function mockContainer(options: MidwayApplicationOptions) {
  return new MockContainer(options);
}

const mm2: MidwayMock = Object.assign({}, mock, {
  container: mockContainer
});

mm2.app = (options) => {
  if (process.env.MIDWAY_BASE_DIR && !options.baseDir) options.baseDir = process.env.MIDWAY_BASE_DIR;
  if (process.env.MIDWAY_FRAMEWORK_PATH && !options.framework) options.framework = process.env.MIDWAY_FRAMEWORK_PATH;
  return mock.app(Object.assign({
    framework: options.framework || 'midway',
    typescript: !!require.extensions['.ts']
  }, options));
};


class MockContainer {

  app;

  constructor(options: MidwayApplicationOptions) {
    this.app = mm2.app(options);
  }

  async ready() {
    await this.app.ready();
  }

  async getAsync(id) {
    return this.app.applicationContext.getAsync(id);
  }

  get(id) {
    return this.app.applicationContext.get(id);
  }
}

export * from './interface';
export {
  mm2 as mm,
  MockContainer,
};
