import { MidwayContextLogger } from '@midwayjs/core';
import { IMidwayRabbitMQContext } from './interface';

export class MidwayRabbitMQContextLogger extends MidwayContextLogger<IMidwayRabbitMQContext> {
  formatContextLabel() {
    const ctx: any = this.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const traceId = (ctx.tracer && ctx.tracer.traceId) || '-';
    const use = Date.now() - ctx.startTime;
    return traceId + '/' + use + 'ms ' + ctx.queueName;
  }
}
