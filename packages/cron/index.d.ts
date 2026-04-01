import { CronOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    cron?: Partial<CronOptions>;
  }
}
