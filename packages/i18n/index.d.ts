import { i18nOptions } from './dist/';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    i18n?: PowerPartial<i18nOptions>;
  }
}
