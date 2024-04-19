import { Context as EggContext, Application as EggApplication } from 'egg';
import {
  IMidwayContainer,
  IMidwayContext,
  IMidwayApplication,
  IConfigurationOptions,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { DefaultState, Middleware } from 'koa';
import { ILogger, LoggerOptions } from '@midwayjs/logger';
import { IParseOptions } from 'qs';

export const RUN_IN_AGENT_KEY = 'egg:run_in_agent';
export const EGG_AGENT_APP_KEY = 'egg_agent_app';

export interface State extends DefaultState {}

export interface IMidwayWebBaseApplication {
  applicationContext: IMidwayContainer;
  getLogger(name?: string): ILogger;
  getCoreLogger(): ILogger;
  generateMiddleware?(middlewareId: any): Promise<Middleware<State, EggContext>>;
  createLogger(name: string, options: LoggerOptions): ILogger;
}

/**
 * @deprecated since version 3.0.0
 * Please use Application from '@midwayjs/web'
 */
export type IMidwayWebApplication = IMidwayApplication<Context, EggApplication & IMidwayWebBaseApplication>;
export interface Application extends IMidwayWebApplication {}
/**
 * @deprecated since version 3.0.0
 * Please use Context from '@midwayjs/web'
 */
export type IMidwayWebContext <ResponseBodyT = unknown> = IMidwayContext<EggContext<ResponseBodyT>>;
export interface Context <ResponseBodyT = unknown> extends IMidwayWebContext <ResponseBodyT> {
  session: {
    /**
     * JSON representation of the session.
     */
    toJSON(): object;
    /**
     * Return how many values there are in the session object.
     * Used to see if it"s "populated".
     */
    readonly length: number;
    /**
     * populated flag, which is just a boolean alias of .length.
     */
    readonly populated: boolean;
    /**
     * get/set session maxAge
     */
    maxAge: number | 'session' | undefined;
    /**
     * commit this session's headers if autoCommit is set to false.
     */
    manuallyCommit(): Promise<void>;
    /**
     * save this session no matter whether it is populated
     */
    save(): void;
    /**
     * allow to put any value on session object
     */
    [_: string]: any;
  };
  state: State;
}
/**
 * @deprecated since version 3.0.0
 * Please use NextFunction from '@midwayjs/web'
 */
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
  /**
   * http query parser mode, default is extended
   */
  queryParseMode?: 'simple' | 'extended';
  /**
   * http query parse options, used when 'simple' mode is used
   */
  queryParseOptions?: IParseOptions;
  /**
   * https/https/http2 server options
   */
  serverOptions?: Record<string, any>;
}

/**
 * @deprecated since version 3.0.0
 * Please use IMiddleware from '@midwayjs/core'
 */
export type MidwayWebMiddleware = Middleware<State, Context>;

/**
 * @deprecated since version 3.0.0
 * Please use IMiddleware from '@midwayjs/core'
 */
export interface IWebMiddleware {
  resolve(): MidwayWebMiddleware;
}
