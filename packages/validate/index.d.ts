export * from './dist/index';

import { validate } from './dist/config.default';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    validate?: validate;
  }
}
