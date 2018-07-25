import {EggMock} from 'egg-mock';
import {mockContainer} from './container';
const mm = require('egg-mock');

interface MidwayMock extends EggMock {
  container: typeof mockContainer;
}
const mm2: MidwayMock = {
  ...mm,
  mockContainer
};

mm2.container = mockContainer;
module.exports = mm2;
