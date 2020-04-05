import { FaaSContext, func, inject, provide } from '@midwayjs/faas';

@provide()
@func('http.handler')
export class HelloHttpService {

  @inject()
  ctx: FaaSContext;  // context

  async handler() {
    return {
      headers: this.ctx.request.headers,
      method: this.ctx.request.method,
      path: this.ctx.request.path,
      body: this.ctx.request.body
    }
  }
}
