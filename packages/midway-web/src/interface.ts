import { KoaMiddleware, KoaMiddlewareParamArray } from '@midwayjs/decorator';

import { Context } from 'egg';
import { EggLoaderOptions } from 'egg-core';
import { IApplicationContext } from 'injection';


export type Middleware = KoaMiddleware<Context>;
export type MiddlewareParamArray = KoaMiddlewareParamArray<Context>;

export interface WebMiddleware {
  resolve(): Middleware
}

export interface MidwayLoaderOptions extends EggLoaderOptions {
  logger: any
  plugins?: any
  baseDir: string
  app: any
  typescript?: boolean
  srcDir?: string
  targetDir?: string
  container?: IApplicationContext
}
