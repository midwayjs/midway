import { AxiosRequestConfig } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    axios?: ServiceFactoryConfigOption<AxiosRequestConfig> & AxiosRequestConfig;
  }
}
