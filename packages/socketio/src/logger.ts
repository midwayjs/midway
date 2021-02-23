import { MidwayContextLogger } from '@midwayjs/logger';
import { IMidwaySocketIOContext } from './interface';

export class MidwaySocketIOContextLogger extends MidwayContextLogger<IMidwaySocketIOContext> {
  formatContextLabel() {
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    // const userId = req?.['session']?.['userId'] || '-';
    // const traceId = '-';
    // const use = Date.now() - this.ctx.startTime;
    // return (
    //   userId +
    //   '/' +
    //   req.ip +
    //   '/' +
    //   traceId +
    //   '/' +
    //   use +
    //   'ms ' +
    //   req.method +
    //   ' ' +
    //   req.url
    return '';
  }
}
