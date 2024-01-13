import {
  Inject,
  Provide,
  ServerlessTriggerType,
  Query,
  Body,
  ServerlessTrigger,
  ServerlessFunction
} from '../../../../../src';

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

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/invoke2', functionName: 'invoke2', handlerName: 'index.invoke2'})
  invoke2() {}

  @ServerlessFunction({ functionName: 'invoke3', handlerName: 'index.invoke3'})
  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  invoke3(){}

  @ServerlessFunction({ functionName: 'invoke4', handlerName: 'index.invoke4'})
  @ServerlessTrigger(ServerlessTriggerType.EVENT, { handlerName: 'index.invoke44'})
  invoke4() {}
}
