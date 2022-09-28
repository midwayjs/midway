import { QueueAdapterOptions } from '@bull-board/api';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line
  interface MidwayConfig {
    bullBoard?: {
      basePath?: string;
      adapterOptions?: QueueAdapterOptions;
    };
  }
}
