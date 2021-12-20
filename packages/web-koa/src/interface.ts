import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context as KoaContext, DefaultState, Middleware, Next } from 'koa';
import { RouterParamValue } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import { CookieSetOptions } from '@midwayjs/cookies';

export type IMidwayKoaContext = IMidwayContext<KoaContext>;
export type IMidwayKoaApplication = IMidwayApplication<IMidwayKoaContext, koa<DefaultState, IMidwayKoaContext> & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware<DefaultState, IMidwayKoaContext>;
  /**
   * @deprecated
   * @param middlewareId
   */
  generateMiddleware(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
}>;

/**
 * @deprecated use NextFunction definition
 */
export type IMidwayKoaNext = Next;
export type NextFunction = Next;

export interface IMidwayKoaConfigurationOptions extends IConfigurationOptions {
  /**
   * cookies sign keys
   */
  keys?: string[];
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

export type MiddlewareParamArray = Array<Middleware<DefaultState, IMidwayKoaContext>>;

export interface IWebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}

export type Application = IMidwayKoaApplication;

export interface Context extends IMidwayKoaContext {}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    keys?: string | string[];
    koa?: IMidwayKoaConfigurationOptions;
    cookies?: CookieSetOptions;
    /**
     * onerror middleware options
     */
    onerror?: {
      text?: (err: Error, ctx: IMidwayKoaContext) => void;
      json?: (err: Error, ctx: IMidwayKoaContext) => void;
      html?: (err: Error, ctx: IMidwayKoaContext) => void;
      redirect?: string;
      template?: string;
      accepts?: (...args) => any;
    },
    bodyParser?: bodyParser.Options;
  }
}
