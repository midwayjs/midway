import {
  AxiosRequestConfig,
} from 'axios';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    axios?: ServiceFactoryConfigOption<AxiosRequestConfig>;
  }
}

