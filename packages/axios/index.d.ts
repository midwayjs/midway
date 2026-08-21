import type { ServiceFactoryConfigOption } from '@midwayjs/core';
import { AxiosRequestConfig } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    axios?: ServiceFactoryConfigOption<AxiosRequestConfig> & AxiosRequestConfig;
  }
}
