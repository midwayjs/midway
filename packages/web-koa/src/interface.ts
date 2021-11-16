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
  /**
   * @deprecated
   * @param middlewareId
   */
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
}

export type MiddlewareParamArray = Array<Middleware<DefaultState, IMidwayKoaContext>>;

export interface IWebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}

export type Application = IMidwayKoaApplication;

export interface Context extends IMidwayKoaContext {}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    koa?: IMidwayKoaConfigurationOptions;
  }
}
