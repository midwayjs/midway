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
    path: '/api_gateway_aliyun',
    method: 'post',
  })
  async handleAPIGatewayEvent(@Body() name) {
    return `hello ${name}`;
  }
}
