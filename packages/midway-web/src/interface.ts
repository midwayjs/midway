import {EggLoaderOptions} from 'egg-core';
import {IApplicationContext} from 'injection';

export interface WebMiddleware {
  resolve(): (context: any, next: () => Promise<any>) => any;
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
