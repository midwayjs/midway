import { Func, Inject, Provide, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @Func('http.handler', { event: 'http', path: '/other', method: 'get'})
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
  @Func(ServerlessTriggerType.HTTP, { path: '/'})
  upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }

}
