import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as koa from 'koa';
import { Context, DefaultState, Middleware } from 'koa';

export type IMidwayKoaContext = IMidwayContext & Context;
export type IMidwayKoaApplication = IMidwayApplication & koa<DefaultState, IMidwayKoaContext>;
export interface IMidwayKoaApplicationPlus {
  use(...args);
}

export interface IMidwayKoaConfigurationOptions {
  port?: number;
}

export type MiddlewareParamArray = Array<Middleware<DefaultState,  IMidwayKoaContext>>;

export interface WebMiddleware {
  resolve(): koa.Middleware<DefaultState, IMidwayKoaContext>;
}
