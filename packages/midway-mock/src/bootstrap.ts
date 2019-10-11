import * as assert from 'power-assert';
import { MidwayMockApplication } from './interface';
import { MidwayMock, mm as mock } from './mock';

// 由于使用Object.assign，丢了默认的mm执行函数，所以使用default输出mm
export const mm: MidwayMock['default'] = mock.default;

export const app: MidwayMockApplication = mock.app({});

before(app.ready);
afterEach(mock.restore);

export {
  assert,
  mock,
};
