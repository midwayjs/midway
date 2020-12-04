import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context, DefaultState, Middleware, Next } from 'koa';
import { RouterParamValue } from '@midwayjs/decorator';

export type IMidwayKoaContext = IMidwayContext & Context;
export type IMidwayKoaApplication = IMidwayApplication & koa<DefaultState, IMidwayKoaContext> & {
  generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any []
  ): Middleware<DefaultState, IMidwayKoaContext>;
  generateMiddleware(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
};

export type IMidwayKoaNext = Next;

export interface IMidwayKoaApplicationPlus {
  use(...args);
}

export interface IMidwayKoaConfigurationOptions {
  /**
   * application http port
   */
  port?: number;
  /**
   * https key
   */
  key?: string;
  /**
   * https cert
   */
  cert?: string;
  /**
   * https ca
   */
  ca?: string;
}

export type MiddlewareParamArray = Array<Middleware<DefaultState, IMidwayKoaContext>>;

export interface IWebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}
