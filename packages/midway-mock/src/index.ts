import {EggMock} from 'egg-mock';
import {mockContainer} from './container';
const mock = require('egg-mock');

interface MidwayMock extends EggMock {
  container: typeof mockContainer;
}

const mm2: MidwayMock = {
  ...mock,
  mockContainer
};

mm2.app = (options) => {
  return mm2.app(Object.assign({
    framework: 'midway'
  }, options));
};
mm2.container = mockContainer;
module.exports = mm2;
