import {
  MidwayRequestContainer,
  IMidwayApplication,
  IConfigurationOptions,
  IMidwayContext,
  NextFunction as BaseNextFunction,
  CommonMiddlewareUnion,
  ContextMiddlewareManager
} from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import { ILogger } from '@midwayjs/logger';
import { Application as ServerlessHttpApplication } from '@midwayjs/serverless-http-parser';

export interface FaaSContext extends IMidwayContext<FaaSHTTPContext> {
  logger: ILogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
}
/**
 * @deprecated
 */
export type FaaSMiddleware = ((context: Context, next: () => Promise<any>) => any) | string;

export type IMidwayFaaSApplication = IMidwayApplication<Context, {
  getInitializeContext();
  use(middleware: FaaSMiddleware);
  /**
   * @deprecated
   * @param middlewareId
   */
  generateMiddleware(middlewareId: any): Promise<FaaSMiddleware>;

  /**
   * Get function name in serverless environment
   */
  getFunctionName(): string;
  /**
   * Get function service name in serverless environment
   */
  getFunctionServiceName(): string;

  useEventMiddleware(middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>): void;
  getEventMiddleware: ContextMiddlewareManager<Context, NextFunction, undefined>;
}> & ServerlessHttpApplication;

export interface Application extends IMidwayFaaSApplication {}

export interface Context extends FaaSContext {}
export type NextFunction = BaseNextFunction;

export interface IFaaSConfigurationOptions extends IConfigurationOptions {
  config?: object;
  initializeContext?: object;
  applicationAdapter?: {
    getApplication(): Application;
    getFunctionName(): string;
    getFunctionServiceName(): string;
    runAppHook?(app: Application): void;
    runEventHook?(...args): any | void;
    runRequestHook?(...args): any | void;
  };
}

/**
 * @deprecated
 */
export interface IWebMiddleware {
  resolve(): FaaSMiddleware;
}
