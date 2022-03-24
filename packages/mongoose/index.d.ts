import { ConnectionOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mongoose?: ServiceFactoryConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
