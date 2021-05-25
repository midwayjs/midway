import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context as KoaContext, DefaultState, Middleware, Next } from 'koa';
import { RouterParamValue } from '@midwayjs/decorator';

export type IMidwayKoaContext = IMidwayContext<KoaContext>;
export type IMidwayKoaApplication = IMidwayApplication<IMidwayKoaContext, koa<DefaultState, IMidwayKoaContext> & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware<DefaultState, IMidwayKoaContext>;
  generateMiddleware(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
}>;

export type IMidwayKoaNext = Next;

export interface IMidwayKoaApplicationPlus<CTX extends IMidwayContext> extends IMidwayApplication<CTX> {
  use(...args);
}

export interface IMidwayKoaConfigurationOptions extends IConfigurationOptions {
  /**
   * application http port
   */
  port?: number;
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
}

export type MiddlewareParamArray = Array<Middleware<DefaultState, IMidwayKoaContext>>;

export interface IWebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}

export type Application = IMidwayKoaApplication;

export interface Context extends IMidwayKoaContext {}
