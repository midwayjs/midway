export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line
  interface MidwayConfig {
    task?: {
      redis?: any;
      prefix?: string;
      defaultJobOptions?: any;
      concurrency?: number;
    };
  }
}
