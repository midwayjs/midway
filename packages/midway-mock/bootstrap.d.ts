import * as assert from 'power-assert';
import { MockApplication, EggMock } from 'egg-mock';
import { MidwayMock, MockContainer } from './dist';

export {
  assert,
  MockContainer
};
export declare const app: MockApplication;
export declare const mock: EggMock;
export declare const mm: MidwayMock;
