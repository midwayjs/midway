import { func, inject, provide } from '@midwayjs/faas';

@provide()
@func('http.handler')
export class HelloHttpService {

  @inject()
  ctx;  // context

  async handler() {

    this.ctx.body = {
      headers: this.ctx.headers,
      method: this.ctx.method,
      path: this.ctx.path,
      body: this.ctx.request.body,
      params: this.ctx.params
    };
  }
}
