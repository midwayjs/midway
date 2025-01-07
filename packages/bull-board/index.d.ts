import '@midwayjs/bull';
import '@midwayjs/bullmq';
import { BullBoardOption } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line
  interface MidwayConfig {
    bullBoard?: PowerPartial<BullBoardOption>;
  }
}
