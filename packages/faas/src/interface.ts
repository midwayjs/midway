import { MidwayRequestContainer, IMidwayApplication, IConfigurationOptions, IMidwayContext } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import type { MidwayHooks } from './hooks';
import { ILogger } from '@midwayjs/logger';

export interface FaaSContext extends FaaSHTTPContext, IMidwayContext {
  logger: ILogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
  hooks: MidwayHooks;
}

export type FaaSMiddleware = (() => (context: FaaSContext, next: () => Promise<any>) => any) | string;

export interface IMidwayFaaSApplication extends IMidwayApplication<FaaSContext> {
  getInitializeContext();
  use(middleware: FaaSMiddleware);
  useMiddleware(mw: string[]);
  generateMiddleware(middlewareId: string): Promise<FaaSMiddleware>;

  /**
   * Get function name in serverless environment
   */
  getFunctionName(): string;
  /**
   * Get function service name in serverless environment
   */
  getFunctionServiceName(): string;
}

/**
 * @deprecated
 * use IMidwayFaaSApplication instead
 */
export type IFaaSApplication = IMidwayFaaSApplication;

/**
 * @deprecated
 */
export interface FunctionHandler {
  handler(...args);
}


export type Application = IMidwayFaaSApplication;

export interface Context extends FaaSContext {};

export interface IFaaSConfigurationOptions extends IConfigurationOptions {
  config?: object;
  middleware?: string[];
  initializeContext?: object;
  applicationAdapter?: {
    getApplication(): IMidwayFaaSApplication;
    getFunctionName(): string;
    getFunctionServiceName(): string;
  };
}

export interface IWebMiddleware {
  resolve(): FaaSMiddleware;
}
