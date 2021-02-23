import { MidwayContextLogger } from '@midwayjs/logger';
import { IMidwayKoaContext } from './interface';

export class MidwayKoaContextLogger extends MidwayContextLogger<IMidwayKoaContext> {
  formatContextLabel() {
    const ctx = this.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const traceId = (ctx.tracer && ctx.tracer.traceId) || '-';
    const use = Date.now() - ctx.startTime;
    return (
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
      ctx.url
    );
  }
}
