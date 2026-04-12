import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayBootstrapOptions,
} from '@midwayjs/core';

export interface MockBootstrapOptions
  extends IMidwayBootstrapOptions, ILifeCycle {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  ssl?: boolean;
  bootstrapTimeout?: number;
  starter?: any;
  entryFile?: string;
  bootstrapMode?: 'faas' | 'app';
  initializeMethodName?: string;
  // Keep mock self-contained in workspace development before core/dist is rebuilt.
  moduleLoader?: (
    p: string,
    options?: {
      enableCache?: boolean;
      loadMode?: 'commonjs' | 'esm';
      safeLoad?: boolean;
      warnOnLoadError?: boolean;
      extraModuleRoot?: string[];
      importQuery?: string;
    }
  ) => Promise<any>;
}

export type ComponentModule = {
  Configuration: new () => any;
};

export interface IBootstrapAppStarter {
  getApp?(type: string): IMidwayApplication<any>;
  close(options?: { sleep?: number }): Promise<void>;
}
