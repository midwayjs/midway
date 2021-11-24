import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IConfigurationOptions,
  IMiddleware,
  IMidwayApplication,
  IMidwayContext
} from '@midwayjs/core';
import { Application as ExpressApplication, NextFunction as ExpressNextFunction, Request, Response } from 'express';

export type IMidwayExpressContext = IMidwayContext<Request>;
export type IMidwayExpressMiddleware = IMiddleware<IMidwayExpressContext, Response, ExpressNextFunction>;
export interface IMidwayExpressApplication extends IMidwayApplication<IMidwayExpressContext, ExpressApplication> {
  /**
   * add global middleware to app
   * @param Middleware
   */
  useMiddleware<Response, NextFunction>(Middleware: CommonMiddlewareUnion<IMidwayExpressContext, Response, NextFunction>): void;

  /**
   * get global middleware
   */
  getMiddleware<Response, NextFunction>(): ContextMiddlewareManager<IMidwayExpressContext, Response, NextFunction>;
}

export interface IMidwayExpressConfigurationOptions extends IConfigurationOptions {
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
}

export type Application = IMidwayExpressApplication;
export type NextFunction = ExpressNextFunction;
export interface Context extends IMidwayExpressContext {}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    express?: IMidwayExpressConfigurationOptions;
  }
}
