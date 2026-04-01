import { BullBoardOption } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    bullBoard?: PowerPartial<BullBoardOption>;
  }
}
