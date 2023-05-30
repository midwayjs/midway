import { IMidwayBootstrapOptions } from '@midwayjs/core';

export interface MockAppConfigurationOptions extends IMidwayBootstrapOptions {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
  entryFile?: string;
}

export type ComponentModule = {
  Configuration: new () => any;
};
