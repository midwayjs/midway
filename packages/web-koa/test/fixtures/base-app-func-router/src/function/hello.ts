import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/other', method: 'get' })
  handler() {
    return {
      method: this.ctx.method,
      path: this.ctx.path,
      headers: this.ctx.headers,
      query: this.ctx.query,
      body: this.ctx.request.body,
    };
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/other', method: 'get', middleware: ['fmw:upload'] })
  upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    };
  }

}
