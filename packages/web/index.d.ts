import {
  Context as IMidwayBaseContext,
  IMidwayBaseApplication,
} from '@midwayjs/core';
import {
  IMidwayWebBaseApplication,
  IMidwayWebConfigurationOptions,
  Context as EggContext,
  State,
} from './dist';
import { ILogger, LoggerOptions } from '@midwayjs/logger';
import { EggAppConfig } from 'egg';

export * from './dist/index';

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }

  // 这里再次覆盖和 egg 不同的定义，不然 egg 插件里可能会报错
  interface Application
    extends IMidwayBaseApplication<EggContext>,
      IMidwayWebBaseApplication {
    createAnonymousContext(...args: any[]): EggContext;
    getCoreLogger(): EggLogger & ILogger;
    getLogger(name?: string): EggLogger & ILogger;
    createLogger(name: string, options: LoggerOptions): EggLogger & ILogger;
  }

  interface Context<ResponseBodyT = any> extends IMidwayBaseContext {
    getLogger(name?: string): ILogger;
    forward: (url: string) => void;
    state: State;
  }
}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig extends PowerPartial<EggAppConfig> {
    egg?: IMidwayWebConfigurationOptions;
  }
}
