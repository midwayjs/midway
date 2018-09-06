import { EggMock } from 'egg-mock';
import { MidwayMockApplication } from './application';
import { MidwayApplicationOptions } from './interface';
import * as path from 'path';
import * as fs from 'fs';

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
  if (!process.env.MIDWAY_PATH) {
    process.env.MIDWAY_PATH = JSON.stringify([
      fs.existsSync(path.join(__dirname, '../src')) ?
        path.join(__dirname, '../../midway-web') :
        path.join(require.resolve('midway-web'), '../../'),
    ]);
  }
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
  const app = new MidwayMockApplication(options);
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

const mm2: MidwayMock = Object.assign({}, mock, {
  container: mockContainer
});

mm2.app = (options) => {
  return mock.app(Object.assign({
    framework: options.framework || 'midway',
    typescript: !!require.extensions['.ts']
  }, options));
};
export { mm2 as mm };
