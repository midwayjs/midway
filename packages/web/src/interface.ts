import { Context as EggContext, Application as EggApplication, EggAppConfig } from 'egg';
import {
  IMidwayContainer,
  IMidwayContext,
  Context as IMidwayBaseContext,
  IMidwayApplication,
  IMidwayBaseApplication,
  IConfigurationOptions,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { DefaultState, Middleware } from 'koa';
import { ILogger, LoggerOptions } from '@midwayjs/logger';

export interface IMidwayWebBaseApplication {
  applicationContext: IMidwayContainer;
  getLogger(name?: string): ILogger;
  getCoreLogger(): ILogger;
  generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, EggContext>>;
  createLogger(name: string, options: LoggerOptions): ILogger;
}

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }

  // 这里再次覆盖和 egg 不同的定义，不然 egg 插件里可能会报错
  interface Application extends IMidwayBaseApplication<Context>, IMidwayWebBaseApplication {
    createAnonymousContext(...args: any[]): EggContext;
    getCoreLogger(): EggLogger & ILogger;
    getLogger(name?: string): EggLogger & ILogger;
    createLogger(name: string, options: LoggerOptions): EggLogger & ILogger;
  }

  interface Context <ResponseBodyT = any> extends IMidwayBaseContext {
    getLogger(name?: string): ILogger;
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
export type IMidwayWebNext = BaseNextFunction;
export type NextFunction = BaseNextFunction;

export interface IMidwayWebConfigurationOptions extends IConfigurationOptions {
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
  /**
   * application http port
   */
  port?: number;
  /**
   * application hostname, 127.0.0.1 as default
   */
  hostname?: string;
  /**
   * https key
   */
  key?: string | Buffer | Array<Buffer | Object>;
  /**
   * https cert
   */
  cert?: string | Buffer | Array<string | Buffer>;
  /**
   * https ca
   */
  ca?: string | Buffer | Array<string | Buffer>;
  /**
   * http2 support
   */
  http2?: boolean;
  /**
   * http global prefix
   */
  globalPrefix?: string;
}

/**
 * @deprecated since version 3.0.0
 * Please use IMiddleware from @midwayjs/core
 */
export type MidwayWebMiddleware = Middleware<DefaultState, Context>;

/**
 * @deprecated since version 3.0.0
 * Please use IMiddleware from @midwayjs/core
 */
export interface IWebMiddleware {
  resolve(): MidwayWebMiddleware;
}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig extends EggAppConfig {
    egg?: IMidwayWebConfigurationOptions;
  }
}
