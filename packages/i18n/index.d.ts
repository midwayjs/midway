import type { PowerPartial } from '@midwayjs/core';
import { I18nOptions } from './dist/';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    i18n?: PowerPartial<I18nOptions>;
  }
}
