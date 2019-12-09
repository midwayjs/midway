import { FaaSContext, func, inject, match, provide } from '../../../../src';

@provide()
@func('index.handler')
export class HelloService {

  @inject()
  ctx: FaaSContext;  // context

  @match({ path: '/api' })
  async api(event) {
    return event.text + this.ctx.method;
  }

  @match({ path: '/test', method: 'POST'})
  async test(event) {
    return event.text + this.ctx.method;
  }

  async handler(event) {
    return event.text + this.ctx.method;
  }
}
