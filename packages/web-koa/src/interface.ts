import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context as KoaContext, DefaultState, Middleware, Next } from 'koa';
import { RouterParamValue } from '@midwayjs/decorator';
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
  generateMiddleware(middlewareId: any): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
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

interface BodyParserOptions {
  enable?: boolean;
  /**
   *  parser will only parse when request type hits enableTypes, default is ['json', 'form'].
   */
  enableTypes?: string[] | undefined;

  /**
   * requested encoding. Default is utf-8 by co-body
   */
  encode?: string | undefined;

  /**
   * limit of the urlencoded body. If the body ends up being larger than this limit
   * a 413 error code is returned. Default is 56kb
   */
  formLimit?: string | undefined;

  /**
   * limit of the json body. Default is 1mb
   */
  jsonLimit?: string | undefined;

  /**
   * limit of the text body. Default is 1mb.
   */
  textLimit?: string | undefined;

  /**
   * limit of the xml body. Default is 1mb.
   */
  xmlLimit?: string | undefined;

  /**
   * when set to true, JSON parser will only accept arrays and objects. Default is true
   */
  strict?: boolean | undefined;

  /**
   * custom json request detect function. Default is null
   */
  detectJSON?: ((ctx: IMidwayKoaContext) => boolean) | undefined;

  /**
   * support extend types
   */
  extendTypes?: {
    json?: string[] | undefined;
    form?: string[] | undefined;
    text?: string[] | undefined;
  } | undefined;

  /**
   * support custom error handle
   */
  onerror?: ((err: Error, ctx: IMidwayKoaContext) => void) | undefined;
}

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
      accepts?: (...args) => any;
    },
    bodyParser?: BodyParserOptions;
    siteFile?: {
      enable?: boolean;
      favicon?: undefined | string | Buffer
    };
  }
}

declare module 'koa' {
  interface Request {
    body?: any;
    rawBody: string;
  }
}

