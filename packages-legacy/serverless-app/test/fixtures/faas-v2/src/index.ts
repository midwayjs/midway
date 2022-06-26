import { Provide, ServerlessTrigger, Inject, ServerlessTriggerType, ServerlessFunction } from '@midwayjs/decorator';
@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/hello',
    method: 'get'
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/hello',
    method: 'post'
  })
  handler() {
    return {
      method: this.ctx.method,
      path: this.ctx.path,
      headers: this.ctx.headers,
      query: this.ctx.query,
      body: this.ctx.request.body,
    }
  }

  @ServerlessFunction({
    functionName: 'upload'
  })
  @ServerlessTrigger(ServerlessTriggerType.EVENT, { middleware: ['fmw:upload'] })
  upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/other', method: 'get'})
  other() {
    return 'hello world'
  }
}
