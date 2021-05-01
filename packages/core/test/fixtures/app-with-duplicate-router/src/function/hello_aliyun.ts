import { Inject, Provide, Query, ServerlessTrigger, ServerlessTriggerType, } from '@midwayjs/decorator';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: any;

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

}
