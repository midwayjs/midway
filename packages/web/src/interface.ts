import { Context, Application } from 'egg';
import {
  IMidwayContainer,
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
  }

  interface Context {
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
