import { Context as EggContext, Application } from 'egg';
import {
  IMidwayContainer,
  IMidwayContext,
  MidwayFrameworkType,
  MidwayProcessTypeEnum
} from '@midwayjs/core';
import { IMidwayKoaConfigurationOptions, IMidwayKoaContext, IMidwayKoaNext } from '@midwayjs/koa';
import { DefaultState, Middleware } from 'koa';
import { ILogger, LoggerOptions } from '@midwayjs/logger';

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
    getLogger(name?: string): EggLogger & ILogger;
    getCoreLogger(): EggLogger;
    generateController?(controllerMapping: string);
    generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
    createLogger(name: string, options: LoggerOptions);
    getProjectName(): string;
    setContextLoggerClass(BaseContextLoggerClass: any): void;
    addConfigObject(obj: any);
  }

  interface Context <ResponseBodyT = any> {
    requestContext: IMidwayContainer;
    getLogger(name?: string): EggLogger & ILogger;
    startTime: number;
  }

  interface EggAppConfig {
    midwayFeature: {
      replaceEggLogger: boolean;
    }
  }
}

export type IMidwayWebApplication = Application;
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
