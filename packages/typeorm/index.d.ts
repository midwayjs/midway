import type { PowerPartial } from '@midwayjs/core';
import { typeormConfigOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    typeorm?: PowerPartial<typeormConfigOptions>;
  }
}
