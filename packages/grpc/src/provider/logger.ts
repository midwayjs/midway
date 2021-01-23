import { MidwayContextLogger } from '@midwayjs/core';
import { IMidwayGRPCContext } from '../interface';

export class MidwayGRPCContextLogger extends MidwayContextLogger<
  IMidwayGRPCContext
  > {
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

  setFormatter() {

  }
}
