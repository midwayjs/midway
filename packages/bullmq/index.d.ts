import { ConnectionOptions } from 'bullmq';
export * from './dist/index';
export { Job } from 'bullmq';
import { IQueueOptions, IWorkerOptions } from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // bullmq 新引入了 worker 作为执行任务的实例，一个队列 queue 和 worker 中 connection， prefix 必须一致才能正常执行
  // 所以 config 中 connection， prefix 单独配置
  // eslint-disable-next-line
  interface MidwayConfig {
    bullmq?: {
      connection: ConnectionOptions;
      prefix?: string;
      defaultQueueOptions?: IQueueOptions;
      defaultWorkerOptions?: IWorkerOptions;
      clearRepeatJobWhenStart?: boolean;
      contextLoggerFormat?: (info: any) => string;
    };
  }
}
