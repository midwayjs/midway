import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  FunctionMiddleware,
  IConfigurationOptions,
  IMiddleware,
  IMidwayApplication,
  IMidwayContext
} from '@midwayjs/core';
import {
  Application as ExpressApplication,
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse
} from 'express';

type Request = IMidwayContext<ExpressRequest>;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;
export interface Context extends Request {}

/**
 * @deprecated use Context
 */
export type IMidwayExpressRequest = Context;
/**
 * @deprecated use Context
 */
export type IMidwayExpressContext = Context;
export type IMidwayExpressMiddleware = IMiddleware<Context, ExpressResponse, ExpressNextFunction>;
export interface IMidwayExpressApplication extends IMidwayApplication<Context, ExpressApplication> {
  /**
   * mount router and middleware
   * @param routerPath
   * @param middleware
   */
  useMiddleware<Response, NextFunction>(routerPath: string, ...middleware: FunctionMiddleware<Context, Response, NextFunction>[]): void;
  /**
   * add global middleware to app
   * @param middleware
   */
  useMiddleware<Response, NextFunction>(middleware: CommonMiddlewareUnion<Context, Response, NextFunction>): void;

  /**
   * get global middleware
   */
  getMiddleware<Response, NextFunction>(): ContextMiddlewareManager<Context, Response, NextFunction>;
}


export interface IMidwayExpressConfigurationOptions extends IConfigurationOptions {
  /**
   * session or cookie secret key
   */
  keys?: string | string[];
  /**
   * application http port
   */
  port?: number;
  /**
   * application hostname, 127.0.0.1 as default
   */
  hostname?: string;
  /**
   * https key
   */
  key?: string | Buffer | Array<Buffer | Object>;
  /**
   * https cert
   */
  cert?: string | Buffer | Array<string | Buffer>;
  /**
   * https ca
   */
  ca?: string | Buffer | Array<string | Buffer>;
  /**
   * http2 support
   */
  http2?: boolean;
  /**
   * http global prefix
   */
  globalPrefix?: string;
  /**
   * https/https/http2 server options
   */
  serverOptions?: Record<string, any>;
}

export type Application = IMidwayExpressApplication;
