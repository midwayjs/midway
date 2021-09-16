import { MockApplication, MockOption } from 'egg-mock';
import { IMidwayContainer } from '@midwayjs/core';

/**
 * @deprecated
 */
export interface MidwayApplicationOptions extends MockOption {
  baseDir?: string;
  framework?: string;
  plugin?: any;
  plugins?: any;
  container?: any;
  typescript?: boolean;
  worker?: number;
}
/**
 * @deprecated
 */
type EggContext = ReturnType<MockApplication['mockContext']>;
/**
 * @deprecated
 */
export interface MidwayMockContext extends EggContext {
  requestContext: IMidwayContainer;
}
/**
 * @deprecated
 */
export type MockClassFunctionHandler = (
  this: MidwayMockApplication,
  className: string,
  methodName: string,
  fnOrData: any,
) => any;

/**
 * @deprecated
 */
export interface MidwayMockApplication extends MockApplication {
  applicationContext: IMidwayContainer;
  pluginContext: IMidwayContainer;
  appDir: string;
  baseDir: string;
  enablePlugins: any;
  getApplicationContext(): IMidwayContainer;
  getPluginContext(): IMidwayContainer;
  getPlugin(pluginName: string): any;
  getLogger(name?: string): any;
  getConfig(key?: string): any;
  mockContext(data?: any): MidwayMockContext;
  mockClassFunction: MockClassFunctionHandler; // Mock class function
}

interface ResultObject {
  data?: string | object;
  status?: number;
  headers?: any;
}

type ResultFunction = (url?: string, opts?: any) => ResultObject | string | void;

type MockHttpClientResult = ResultObject | ResultFunction | string;

declare module 'egg' {
  interface Application {
    /**
     * mock Context
     */
    mockContext(data?: any): Context;

    /**
     * mock cookie session
     */
    mockSession(data: any): Application;

    mockCookies(cookies: any): Application;

    mockHeaders(headers: any): Application;

    /**
     * Mock service
     */
    mockService(service: string, methodName: string, fn: any): Application;

    /**
     * mock service that return error
     */
    mockServiceError(service: string, methodName: string, err?: Error): Application;

    mockHttpclient(mockUrl: string | RegExp, mockMethod: string | string[], mockResult: MockHttpClientResult): Application;

    mockHttpclient(mockUrl: string | RegExp, mockResult: MockHttpClientResult): Application;

    /**
     * mock csrf
     */
    mockCsrf(): Application;

    mockClassFunction(className: string, methodName: string, fnOrData: any): Application;
  }
}
