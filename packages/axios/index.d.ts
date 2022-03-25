import { AxiosRequestConfig } from 'axios';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    axios?: AxiosRequestConfig;
  }
}
