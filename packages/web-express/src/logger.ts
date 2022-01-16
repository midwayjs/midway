import { MidwayContextLogger } from '@midwayjs/logger';
import { Context } from './interface';

export class MidwayExpressContextLogger extends MidwayContextLogger<Context> {
  formatContextLabel() {
    const req = this.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = req?.['session']?.['userId'] || '-';
    const traceId = '-';
    const use = Date.now() - this.ctx.startTime;
    return (
      userId +
      '/' +
      req.ip +
      '/' +
      traceId +
      '/' +
      use +
      'ms ' +
      req.method +
      ' ' +
      req.url
    );
  }
}
