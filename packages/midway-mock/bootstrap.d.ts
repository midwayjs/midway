import * as assert from 'power-assert';
import { MockApplication, EggMock } from 'egg-mock';
import { IApplicationContext } from 'injection';

interface MMockApplication extends MockApplication {
  applicationContext: IApplicationContext;
  /**
   * Mock class function
   */
  mockClassFunction(className: string, methodName: string, fn: any): any;
}

export {
  assert
};
export declare const app: MMockApplication;
export declare const mock: EggMock;
export declare const mm: EggMock;
