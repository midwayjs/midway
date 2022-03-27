import { ConnectionOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mongoose?: ServiceFactoryConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
