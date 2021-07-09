import { MidwayRequestContainer, IMidwayApplication, IConfigurationOptions, IMidwayContext } from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import type { MidwayHooks } from './hooks';
import { ILogger } from '@midwayjs/logger';

export interface FaaSContext extends IMidwayContext<FaaSHTTPContext> {
  logger: ILogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
  hooks?: MidwayHooks;
}

export type FaaSMiddleware = ((context: FaaSContext, next: () => Promise<any>) => any) | string;

export type IMidwayFaaSApplication = IMidwayApplication<FaaSContext, {
  getInitializeContext();
  use(middleware: FaaSMiddleware);
  useMiddleware(mw: string[]);
  generateMiddleware(middlewareId: any): Promise<FaaSMiddleware>;

  /**
   * Get function name in serverless environment
   */
  getFunctionName(): string;
  /**
   * Get function service name in serverless environment
   */
  getFunctionServiceName(): string;
}>;

export interface Application extends IMidwayFaaSApplication {}

export interface Context extends FaaSContext {}

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
