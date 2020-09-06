import { Context, Application } from 'egg';
import { KoaMiddleware, KoaMiddlewareParamArray } from '@midwayjs/decorator';
import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions } from '@midwayjs/koa';

export type IMidwayWebApplication = IMidwayApplication & Application;
export type IMidwayWebContext = IMidwayContext & Context;

export interface IMidwayWebConfigurationOptions extends IMidwayKoaConfigurationOptions {
  plugins?: {
    [plugin: string]: {
      enable: boolean;
      path?: string;
      package?: string;
    }
  };
  typescript?: boolean;
}

export type Middleware = KoaMiddleware<IMidwayWebContext>;
export type MiddlewareParamArray = KoaMiddlewareParamArray<IMidwayWebContext>;

export interface WebMiddleware {
  resolve(): Middleware;
}
