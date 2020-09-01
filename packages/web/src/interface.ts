import { Context } from 'egg';
import { KoaMiddleware, KoaMiddlewareParamArray } from '@midwayjs/decorator';

export interface IMidwayWebConfigurationOptions {
  port?: number;
  plugins?: {
    [plugin: string]: {
      enable: boolean;
      path?: string;
      package?: string;
    }
  };
  typescript?: boolean;
}

export type Middleware = KoaMiddleware<Context>;
export type MiddlewareParamArray = KoaMiddlewareParamArray<Context>;

export interface WebMiddleware {
  resolve(): Middleware;
}
