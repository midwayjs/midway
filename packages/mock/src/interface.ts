import { IMidwayApplication, IMidwayBootstrapOptions, MidwayFrameworkType } from '@midwayjs/core';

export interface MockAppConfigurationOptions extends IMidwayBootstrapOptions {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
}

export interface MockBootstrapOptions extends MockAppConfigurationOptions {
  entryFile?: string;
  bootstrapMode?: 'faas' | 'app';
}

export type ComponentModule = {
  Configuration: new () => any;
};

export interface IBootstrapAppStarter {
  getApp?(type: MidwayFrameworkType | string): IMidwayApplication<any>;
  close(options?: { sleep?: number }): Promise<void>;
}
