import { Func, Inject, Provide, ServerlessTriggerType, Body, ServerlessTrigger } from '@midwayjs/decorator';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @Func('http.handler', { event: 'http', path: '/other', method: 'all'})
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
  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/upload'})
  @ServerlessTrigger(ServerlessTriggerType.HSF)
  upload(@Body() event) {
    const { files, fields } = event;
    return {
      files,
      fields
    }
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/invoke'})
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, { path: '/update', method: 'post'})
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {type: 'every', value: '5m',  payload: ''})
  invoke() {

  }

}
