import {
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IConfigurationOptions,
  IMiddleware,
  IMidwayApplication,
  IMidwayContext
} from '@midwayjs/core';
import {
  Application as ExpressApplication,
  CookieOptions,
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse
} from 'express';
import { Options, OptionsJson, OptionsText, OptionsUrlencoded } from 'body-parser';

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
   * add global middleware to app
   * @param Middleware
   */
  useMiddleware<Response, NextFunction>(Middleware: CommonMiddlewareUnion<Context, Response, NextFunction>): void;

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
}

export type Application = IMidwayExpressApplication;

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    express?: IMidwayExpressConfigurationOptions;
    cookieParser?: {
      secret?: string | string[];
      options?: CookieOptions;
    };
    bodyParser?: {
      enable?: boolean;
      json?: OptionsJson & {
        enable?: boolean;
      };
      raw?: Options & {
        enable?: boolean;
      };
      text?: OptionsText & {
        enable?: boolean;
      };
      urlencoded?: OptionsUrlencoded & {
        enable?: boolean;
      };
    };
  }
}
