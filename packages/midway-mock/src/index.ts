import { EggMock } from 'egg-mock';
import { MidwayMockApplication } from './application';
import { MidwayApplicationOptions } from './interface';
import { EggCoreOptions } from 'egg-core';

const mock = require('egg-mock');

interface MidwayMock extends EggMock {
  container: typeof mockContainer;
  default: typeof mock;
}

/**
 * 只初始化app级别的container
 * agent相关的逻辑使用mm2.app
 * @param options 参数
 */
function mockContainer(options: MidwayApplicationOptions) {
  options.container = Object.assign({
    loadDir: ['app', 'lib'],
    ignore: [
      '**/node_modules/**',
      '**/logs/**',
      '**/run/**',
      '**/public/**',
      '**/view/**',
      '**/views/**',
      '**/config/**'
    ]
  }, options.container || {});
  const app = new MidwayMockApplication(<EggCoreOptions><any>options);
  app.loader.load();
  let container = app.getApplicationContext();
  const oldReady = container.ready;
  container.ready = async () => {
    // hack处理，防止重复ready导致逻辑无法执行
    if (container.__ready__) {
      return;
    }
    container.__ready__ = true;
    await app.ready();
    return await oldReady.call(container);
  };

  return container;
}

const mm2: MidwayMock = {
  ...mock,
  mockContainer
};

mm2.app = (options) => {
  return mm2.app(Object.assign({
    framework: options.framework || 'midway',
    typescript: !!require.extensions['.ts']
  }, options));
};
mm2.container = mockContainer;
export { mm2 as mm };
