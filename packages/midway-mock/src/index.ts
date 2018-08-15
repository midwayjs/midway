import {EggMock} from 'egg-mock';
import {MidwayContainer} from 'midway-core';
const mock = require('egg-mock');

const DEFAULT_CONTAINER = {
  disableAutoLoad: false,
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
};

interface MidwayMock extends EggMock {
  container: typeof mockContainer;
}

function mockContainer(options: {
  baseDir: string,
  container: any
}) {
  const container = new MidwayContainer(options.baseDir);
  const config = Object.assign(options.container || {},
    DEFAULT_CONTAINER);

  container.configLocations = config.configLocations || [];

}

const mm2: MidwayMock = {
  ...mock,
  mockContainer
};

mm2.app = (options) => {
  return mm2.app(Object.assign({
    framework: options.framework || 'midway'
  }, options));
};
mm2.container = mockContainer;
module.exports = mm2;
exports.mm = mm2;
export default mm2;
