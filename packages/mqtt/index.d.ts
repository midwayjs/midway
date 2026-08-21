import type { PowerPartial } from '@midwayjs/core';
import { IMidwayMQTTConfigurationOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mqtt?: PowerPartial<IMidwayMQTTConfigurationOptions>;
  }
}
