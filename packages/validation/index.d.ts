import '@midwayjs/i18n';
import { ValidationOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    validation?: ValidationOptions;
  }
}
