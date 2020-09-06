import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { KoaMiddlewareParamArray } from '@midwayjs/decorator';
import * as koa from 'koa';
import { Context, DefaultState } from 'koa';

export type IMidwayKoaContext = IMidwayContext & Context;
export type IMidwayKoaApplication = IMidwayApplication & koa<DefaultState, IMidwayKoaContext>;
export interface IMidwayKoaApplicationPlus {
  use(...args);
}

export interface IMidwayKoaConfigurationOptions {
  port?: number;
}

export type MiddlewareParamArray = KoaMiddlewareParamArray<IMidwayKoaContext>;

export interface WebMiddleware {
  resolve(): koa.Middleware;
}
