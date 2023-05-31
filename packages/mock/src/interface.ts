import { IMidwayApplication, IMidwayBootstrapOptions, MidwayFrameworkType } from '@midwayjs/core';

export interface MockAppConfigurationOptions extends IMidwayBootstrapOptions {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
  entryFile?: string;
}

export type ComponentModule = {
  Configuration: new () => any;
};

export interface IBootstrapAppStarter {
  getApp?(type: MidwayFrameworkType | string): IMidwayApplication<any>;
  close(options?: { sleep?: number }): Promise<void>;
}
