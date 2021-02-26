import { Provide, Func, Inject } from '@midwayjs/decorator';
console.log(require('@midwayjs/decorator').version);
console.log(require.resolve('@midwayjs/decorator'));
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

  @Func('http.oth', { event: 'http', path: '/other', method: 'get'})
  other() {
    return 'hello world'
  }
}
