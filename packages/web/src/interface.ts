import { Context, Application } from 'egg';
import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions, IMidwayKoaContext } from '@midwayjs/koa';
import { DefaultState, Middleware } from 'koa';

export type IMidwayWebApplication = IMidwayApplication & Application & {
  generateController(controllerMapping: string);
  generateMiddleware(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
};
export type IMidwayWebContext = IMidwayContext & Context;

export interface IMidwayWebConfigurationOptions extends IMidwayKoaConfigurationOptions {
  app?: IMidwayWebApplication;
  plugins?: {
    [plugin: string]: {
      enable: boolean;
      path?: string;
      package?: string;
    }
  };
  typescript?: boolean;
  processType?: 'application' | 'agent';
}

export type MidwayWebMiddleware = Middleware<DefaultState, IMidwayWebContext>;

export interface WebMiddleware {
  resolve(): MidwayWebMiddleware;
}
