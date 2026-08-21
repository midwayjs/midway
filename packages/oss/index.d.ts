import type { ServiceFactoryConfigOption } from '@midwayjs/core';
import { OSSServiceFactoryCreateClientConfigType } from './dist';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    oss?: ServiceFactoryConfigOption<OSSServiceFactoryCreateClientConfigType>;
  }
}
