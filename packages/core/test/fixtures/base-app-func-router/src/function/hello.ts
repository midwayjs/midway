import { Func, Inject, Provide, ServerlessTriggerType, Query, Body, ServerlessTrigger } from '@midwayjs/decorator';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @Func('http.handler', { event: 'http', path: '/other', method: 'all', middleware: ['auth'] })
  handler() {
    return {
      method: this.ctx.method,
      path: this.ctx.path,
      headers: this.ctx.headers,
      query: this.ctx.query,
      body: this.ctx.request.body,
    }
  }

  @Func('http.upload', { middleware: ['fmw:upload'] })
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
