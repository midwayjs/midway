import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessTriggerType,
  Body,
} from '@midwayjs/decorator';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: any;

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/api_gateway_tencent',
    method: 'post',
  })
  async handleAPIGatewayEvent(@Body() name) {
    return `hello ${name}`;
  }

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron', // or every
    value: '0 0 4 * * *', // or 1m
  })
  async handleTimerEvent(event) {
    this.ctx.logger.info(event);
    return 'hello world';
  }

  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated:*',
    filter: {
      prefix: 'filterdir/',
      suffix: '.jpg',
    },
  })
  async handleCOSEvent(event) {
    this.ctx.logger.info(event);
    return 'hello world';
  }

  @ServerlessTrigger(ServerlessTriggerType.MQ, {
    topic: 'test-topic',
  })
  async handleCMQEvent(event) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
