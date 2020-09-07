import { Context, Application } from 'egg';
import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions } from '@midwayjs/koa';
import { DefaultState, Middleware } from 'koa';

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

export type MidwayWebMiddleware = Middleware<DefaultState, IMidwayWebContext>;

export interface WebMiddleware {
  resolve(): MidwayWebMiddleware;
}
