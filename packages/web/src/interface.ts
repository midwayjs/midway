import { Context as EggContext, Application as EggApplication, EggLogger } from 'egg';
import {
  IMidwayContainer,
  IMidwayContext,
  Context as IMidwayBaseContext,
  IMidwayApplication,
  IMidwayBaseApplication
} from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions, IMidwayKoaContext, IMidwayKoaNext } from '@midwayjs/koa';
import { DefaultState, Middleware } from 'koa';
import { ILogger, LoggerOptions } from '@midwayjs/logger';

export interface IMidwayWebBaseApplication {
  applicationContext: IMidwayContainer;
  getLogger(name?: string): EggLogger & ILogger;
  getCoreLogger(): EggLogger & ILogger;
  generateController?(controllerMapping: string);
  generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
  createLogger(name: string, options: LoggerOptions): EggLogger & ILogger;
}

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }

  interface Application extends IMidwayBaseApplication, IMidwayWebBaseApplication {}

  interface Context <ResponseBodyT = any> extends IMidwayBaseContext {
    getLogger(name?: string): EggLogger & ILogger;
  }

  interface EggAppConfig {
    midwayFeature: {
      replaceEggLogger: boolean;
    }
  }
}

export type IMidwayWebApplication = IMidwayApplication<Context, EggApplication & IMidwayWebBaseApplication>;
export interface Application extends IMidwayWebApplication {}
export interface Context <ResponseBodyT = unknown> extends IMidwayWebContext <ResponseBodyT> {}
export type IMidwayWebContext <ResponseBodyT = unknown> = IMidwayContext<EggContext<ResponseBodyT>>;
export type IMidwayWebNext = IMidwayKoaNext;

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
  globalConfig?: any;
}

export type MidwayWebMiddleware = Middleware<DefaultState, Context>;

export interface IWebMiddleware {
  resolve(): MidwayWebMiddleware;
}
