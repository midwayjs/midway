import * as bull from 'bull';
export * from './dist/index';
export { Job, JobId } from 'bull';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    bull?: {
      defaultQueueOptions?: bull.QueueOptions;
      defaultConcurrency?: number;
      clearRepeatJobWhenStart?: boolean;
      contextLoggerFormat?: (info: any) => string;
    };
  }
}
