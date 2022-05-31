import { IMidwayBootstrapOptions, IMidwayContainer } from '@midwayjs/core';

export interface MockAppConfigurationOptions extends IMidwayBootstrapOptions {
  starter?: {
    start: (options: any) => any;
    getApplicationContext(): IMidwayContainer;
  };
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
}

export type ComponentModule = {
  Configuration: new () => any;
};
