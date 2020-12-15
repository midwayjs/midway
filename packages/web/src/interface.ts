import { Context, Application } from 'egg';
import {
  IMidwayContainer,
  MidwayFrameworkType,
  MidwayProcessTypeEnum
} from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions, IMidwayKoaContext, IMidwayKoaNext } from '@midwayjs/koa';
import { DefaultState, Middleware } from 'koa';

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }

  interface Application {
    applicationContext: IMidwayContainer;
    getBaseDir(): string;
    getAppDir(): string;
    getEnv(): string;
    getFrameworkType(): MidwayFrameworkType;
    getProcessType(): MidwayProcessTypeEnum;
    getApplicationContext(): IMidwayContainer;
    getConfig(key?: string): any;
    generateController?(controllerMapping: string);
    generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
    createLogger(name: string, options);
    getProjectName();
  }

  interface Context {
    requestContext: IMidwayContainer;
  }
}

export type IMidwayWebApplication = Application;
export type IMidwayWebContext = Context;
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
