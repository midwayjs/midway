import { MidwayContextLogger } from '@midwayjs/logger';
import { IMidwayExpressContext } from './interface';

export class MidwayExpressContextLogger extends MidwayContextLogger<IMidwayExpressContext> {
  formatContextLabel() {
    const req = this.ctx.req;
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
