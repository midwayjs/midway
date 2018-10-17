import * as assert from 'power-assert';
import { MockApplication, EggMock } from 'egg-mock';
import { IApplicationContext } from 'injection';

interface MMockApplication extends MockApplication {
  applicationContext: IApplicationContext;
}

export {
  assert
};
export declare const app: MMockApplication;
export declare const mock: EggMock;
export declare const mm: EggMock;
