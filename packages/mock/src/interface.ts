import { IMidwayBootstrapOptions } from '@midwayjs/core';

export interface MockAppConfigurationOptions extends IMidwayBootstrapOptions {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
}

export type ComponentModule = {
  Configuration: new () => any;
};
