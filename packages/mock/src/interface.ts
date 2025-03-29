import { IMidwayApplication, IMidwayBootstrapOptions } from '@midwayjs/core';

export interface MockBootstrapOptions extends IMidwayBootstrapOptions {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
  bootstrapTimeout?: number;
  starter?: any;
  entryFile?: string;
  bootstrapMode?: 'faas' | 'app';
  initializeMethodName?: string;
}

export type ComponentModule = {
  Configuration: new () => any;
};

export interface IBootstrapAppStarter {
  getApp?(type: string): IMidwayApplication<any>;
  close(options?: { sleep?: number }): Promise<void>;
}
