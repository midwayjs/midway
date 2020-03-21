import { MockApplication, MockOption } from 'egg-mock';
import { IApplicationContext } from 'injection';

export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string;
  framework?: string;
  plugin?: any;
  plugins?: any;
  container?: any;
  typescript?: boolean;
  worker?: number;
}

type EggContext = Pick<MockApplication, 'mockContext'>;

export type MidwayMockContext = EggContext & {
  requestContext: IApplicationContext;
};

export type FilterPick<T, U> = Pick<T, Exclude<keyof T, U>>;

export interface MidwayMockApplication extends MockApplication {
  applicationContext: IApplicationContext;
  pluginContext: IApplicationContext;
  appDir: string;
  baseDir: string;
  enablePlugins: any;
  getApplicationContext(): IApplicationContext;
  getPluginContext(): IApplicationContext;
  getPlugin(pluginName: string): any;
  getLogger(name?: string): any;
  getConfig(key?: string): any;
  mockContext(data?: any): MidwayMockContext;
  /**
   * Mock class function
   */
  mockClassFunction(
    this: MidwayMockApplication,
    className: string,
    methodName: string,
    fnOrData: any,
  ): any
}
