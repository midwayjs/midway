import { i18n } from './config.default';

export interface TranslateOptions {
  lang?: string;
  args: any;
}

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    i18n?: typeof i18n;
  }
}
