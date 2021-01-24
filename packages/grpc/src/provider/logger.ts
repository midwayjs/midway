import { MidwayContextLogger } from '@midwayjs/core';
import { IMidwayGRPCContext } from '../interface';

export class MidwayGRPCContextLogger extends MidwayContextLogger<
  IMidwayGRPCContext
  > {
  formatContextLabel() {
    const ctx = this.ctx;
    const use = Date.now() - ctx.startTime;
    return (
      ctx.method +
      '/' +
      use +
      'ms'
    );
  }
}
