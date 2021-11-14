import { Inject, Provide, ServerlessTriggerType, Query, Body, ServerlessTrigger } from '@midwayjs/decorator';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/upload', middleware: ['fmw:upload']})
  @ServerlessTrigger(ServerlessTriggerType.HSF)
  upload(@Query() name) {

  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/invoke'})
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, { path: '/update', method: 'post', middleware: ['auth']})
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {type: 'every', value: '5m',  payload: ''})
  invoke(@Body() event) {

  }

}
