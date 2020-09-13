import { MidwayRequestContainer, IMidwayApplication, IMidwayLogger } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import type { MidwayHooks } from './hooks';

export interface IFaaSApplication extends IMidwayApplication {
  getInitializeContext();
  use(
    middleware: (() => (context: any, next: () => Promise<any>) => any) | string
  );
  useMiddleware(mw: string[]);
}

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
    getApplication(): IFaaSApplication;
  };
}
