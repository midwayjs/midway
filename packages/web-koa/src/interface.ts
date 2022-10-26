import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context as KoaContext, DefaultState, Middleware, Next } from 'koa';
import { RouterParamValue } from '@midwayjs/core';

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
  /**
   * Trust proxy headers
   */
  proxy?: boolean;
  /**
   * Subdomain offset
   */
  subdomainOffset?: number;
  /**
   * Proxy IP header, defaults to X-Forwarded-For
   */
  proxyIpHeader?: string;
  /**
   * Max IPs read from proxy IP header, default to 0 (means infinity)
   */
  maxIpsCount?: number;
  /**
   * server timeout in milliseconds, default to 2 minutes.
   *
   * for special request, just use `ctx.req.setTimeout(ms)`
   *
   * @see https://nodejs.org/api/http.html#http_server_timeout
   */
  serverTimeout?: number;
}

export type MiddlewareParamArray = Array<
  Middleware<DefaultState, IMidwayKoaContext>
>;

export interface IWebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}

export type Application = IMidwayKoaApplication;

export interface Context extends IMidwayKoaContext {}

export interface BodyParserOptions {
  enable?: boolean;
  /**
   *  parser will only parse when request type hits enableTypes, default is ['json', 'form'].
   */
  enableTypes?: string[];

  /**
   * requested encoding. Default is utf-8 by co-body
   */
  encoding?: string;

  /**
   * limit of the urlencoded body. If the body ends up being larger than this limit
   * a 413 error code is returned. Default is 56kb
   */
  formLimit?: string;

  /**
   * limit of the json body. Default is 1mb
   */
  jsonLimit?: string;

  /**
   * limit of the text body. Default is 1mb.
   */
  textLimit?: string;

  /**
   * limit of the xml body. Default is 1mb.
   */
  xmlLimit?: string;

  /**
   * when set to true, JSON parser will only accept arrays and objects. Default is true
   */
  strict?: boolean;

  /**
   * custom json request detect function. Default is null
   */
  detectJSON?: (ctx: IMidwayKoaContext) => boolean;

  /**
   * support extend types
   */
  extendTypes?: {
    json?: string[] | string | undefined;
    form?: string[] | string | undefined;
    text?: string[] | string | undefined;
  };

  /**
   * support custom error handle
   */
  onerror?: (err: Error, ctx: IMidwayKoaContext) => void;
}
