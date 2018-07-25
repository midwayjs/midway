import {EggLoaderOptions} from 'egg-core';

export interface MidwayLoaderOptions extends EggLoaderOptions {
  logger: any;
  plugins?: any;
  baseDir: string;
  app: any;
  typescript?: boolean;
  srcDir?: string;
  targetDir?: string;
}
