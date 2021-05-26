import {
  Inject,
  Provide,
  Query,
  ServerlessFunction,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/decorator';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: any;

  @ServerlessFunction({
    functionName: 'hello_bbb',
    concurrency: 2
  })
  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handleEvent(event: any) {
    return event;
  }

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/api_gateway_aliyun',
    method: 'post',
  })
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/api_another',
    method: 'post',
  })
  async handleAPIGatewayEvent(@Query() name) {
    return `hello ${name}`;
  }

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron', // or every
    value: '0 0 4 * * *', // or 1m
    name: 'custom_timer',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron', // or every
    value: '0 0 1 * * *', // or 1m
  })
  async handleTimerEvent(event) {
    return 'hello world';
  }

  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: 'ossBucketName',
    events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject'],
    filter: {
      prefix: 'filterdir/',
      suffix: '.jpg',
    },
  })
  async handleOSSEvent(event) {
    return 'hello world';
  }

}
