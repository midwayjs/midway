import { MockApplication, MockOption } from 'egg-mock';
import { IApplicationContext, IMidwayContainer } from '@midwayjs/core';

export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string;
  framework?: string;
  plugin?: any;
  plugins?: any;
  container?: any;
  typescript?: boolean;
  worker?: number;
}

type EggContext = ReturnType<MockApplication['mockContext']>;

export interface MidwayMockContext extends EggContext {
  requestContext: IMidwayContainer;
}

export type MockClassFunctionHandler = (
  this: MidwayMockApplication,
  className: string,
  methodName: string,
  fnOrData: any,
) => any;

export interface MidwayMockApplication extends MockApplication {
  applicationContext: IMidwayContainer;
  pluginContext: IMidwayContainer;
  appDir: string;
  baseDir: string;
  enablePlugins: any;
  getApplicationContext(): IMidwayContainer;
  getPluginContext(): IApplicationContext;
  getPlugin(pluginName: string): any;
  getLogger(name?: string): any;
  getConfig(key?: string): any;
  mockContext(data?: any): MidwayMockContext;
  mockClassFunction: MockClassFunctionHandler; // Mock class function
}
