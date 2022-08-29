export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line
  interface MidwayConfig {
    bull?: {
      redis?: any;
      prefix?: string;
      defaultJobOptions?: any;
      concurrency?: number;
    };
  }
}
