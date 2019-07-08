import {EggLoaderOptions} from 'egg-core';
import {IApplicationContext} from 'injection';
import {KoaMiddleware} from '@midwayjs/decorator';

export interface WebMiddleware {
  resolve(): KoaMiddleware;
}

export interface MidwayLoaderOptions extends EggLoaderOptions {
  logger: any;
  plugins?: any;
  baseDir: string;
  app: any;
  typescript?: boolean;
  srcDir?: string;
  targetDir?: string;
  container?: IApplicationContext;
}
