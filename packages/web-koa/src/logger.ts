import { MidwayContextLogger } from '@midwayjs/core';
import { IMidwayKoaContext } from './interface';

export class MidwayKoaContextLogger extends MidwayContextLogger<IMidwayKoaContext> {
  formatContextLabel() {
    const ctx = this.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const traceId = (ctx.tracer && ctx.tracer.traceId) || '-';
    const use = ctx.starttime ? Date.now() - ctx.starttime : 0;
    return (
      '[' +
      userId +
      '/' +
      ctx.ip +
      '/' +
      traceId +
      '/' +
      use +
      'ms ' +
      ctx.method +
      ' ' +
      ctx.url +
      ']'
    );
  }
}
