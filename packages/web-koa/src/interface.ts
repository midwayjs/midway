import { IMidwayApplication } from "@midwayjs/core";
import { Application } from 'koa/lib/application';
import { KoaMiddleware, KoaMiddlewareParamArray } from '@midwayjs/decorator';
import { Context } from 'koa';

export type IMidwayWebApplication = IMidwayApplication & Application;

export interface IMidwayWebConfigurationOptions {
  port?: number;
}

export type Middleware = KoaMiddleware<Context>;
export type MiddlewareParamArray = KoaMiddlewareParamArray<Context>;

export interface WebMiddleware {
  resolve(): Middleware;
}
