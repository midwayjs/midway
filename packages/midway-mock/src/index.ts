import { EggMock } from 'egg-mock';
import { MidwayApplicationOptions, MidwayMockApplication } from './interface';
export * from 'egg-mock';

const mock = require('egg-mock');

export interface MidwayMock extends EggMock {
  container: typeof mockContainer;
  default: typeof mock;
  app: (option?: MidwayApplicationOptions) => MidwayMockApplication;
  cluster: (option?: MidwayApplicationOptions) => MidwayMockApplication;
}

/**
 * 只初始化app级别的container
 * agent相关的逻辑使用mm2.app
 * @param options 参数
 */
function mockContainer(options: MidwayApplicationOptions) {
  return new MockContainer(options);
}

function findFramework(module) {
  try {
    if (require.resolve(module)) {
      return module;
    }
  } catch (err) {
    console.log(`[midway-bin] Not found framework ${module} and skip.`);
  }
}

const defaultFramework = findFramework('midway') || findFramework('midway-mirror');

const mm2: MidwayMock = Object.assign({}, mock, {
  container: mockContainer,
});

mm2.app = (options): MidwayMockApplication => {
  if (process.env.MIDWAY_BASE_DIR && !options.baseDir) { options.baseDir = process.env.MIDWAY_BASE_DIR; }
  if (process.env.MIDWAY_FRAMEWORK_PATH && !options.framework) { options.framework = process.env.MIDWAY_FRAMEWORK_PATH; }
  return mock.app(Object.assign({
    framework: options.framework || defaultFramework,
    typescript: !!require.extensions['.ts'],
  }, options));
};

mm2.cluster = (options) => {
  if (process.env.MIDWAY_BASE_DIR && !options.baseDir) { options.baseDir = process.env.MIDWAY_BASE_DIR; }
  if (process.env.MIDWAY_FRAMEWORK_PATH && !options.framework) { options.framework = process.env.MIDWAY_FRAMEWORK_PATH; }
  return mock.cluster(Object.assign({
    framework: options.framework || defaultFramework,
    typescript: !!require.extensions['.ts'],
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
