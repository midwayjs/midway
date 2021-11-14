import { MidwayContextLogger } from '@midwayjs/logger';
import { Context } from 'egg';

export class MidwayCustomContextLogger extends MidwayContextLogger<Context> {
  formatContextLabel() {
    const ctx = this.ctx;
    return `${Date.now() - ctx.startTime}ms ${ctx.method} abcde`;
  }
}
