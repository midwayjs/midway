import { MidwayRequestContainer, IMidwayApplication, IMidwayLogger } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import type { MidwayHooks } from './hooks';

export type FaaSMiddleware = (() => (context: FaaSContext, next: () => Promise<any>) => any) | string;

export interface IMidwayFaaSApplication extends IMidwayApplication {
  getInitializeContext();
  use(middleware: FaaSMiddleware);
  useMiddleware(mw: string[]);
  generateMiddleware(middlewareId: string): Promise<FaaSMiddleware>;
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

export interface FaaSContext extends FaaSHTTPContext {
  logger: IMidwayLogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
  hooks: MidwayHooks;
}

export interface IFaaSConfigurationOptions {
  config?: object;
  middleware?: string[];
  initializeContext?: object;
  applicationAdapter?: {
    getApplication(): IMidwayFaaSApplication;
  };
}

export interface WebMiddleware {
  resolve(): FaaSMiddleware;
}
