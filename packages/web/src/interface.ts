import { Context } from 'egg';
import { KoaMiddleware, KoaMiddlewareParamArray } from '@midwayjs/decorator';

export interface IMidwayWebConfigurationOptions {
  port: number;
}

export type Middleware = KoaMiddleware<Context>;
export type MiddlewareParamArray = KoaMiddlewareParamArray<Context>;

export interface WebMiddleware {
  resolve(): Middleware;
}
