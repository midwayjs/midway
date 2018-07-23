import {EggMock} from 'egg-mock';
import {mockContainer} from './container';
const mm = require('egg-mock');

interface MidwayMock extends EggMock {
  mockContainer: typeof mockContainer;
}
const mm2: MidwayMock = {
  ...mm,
  mockContainer
};

mm2.mockContainer = mockContainer;
module.exports = mm2;
