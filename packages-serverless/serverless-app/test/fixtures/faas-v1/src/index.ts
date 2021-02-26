import { decorator } from '@midwayjs/test-faas-version-1';
const { Provide, Func, Inject } = decorator;

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @Func('http.handler')
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
  upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }
}
