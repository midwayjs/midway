import {
  provide,
  func,
  FunctionHandler,
  inject,
  FaaSContext,
} from '@midwayjs/faas';

@provide()
@func('index.handler')
export class IndexHandler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {
    console.log('this.ctx.req.body', this.ctx.req.body, this.ctx.query);
    const name = this.ctx.req.body['name'];
    const action = this.ctx.query['action'];
    this.ctx.type = 'text/html; charset=utf-8';
    this.ctx.set('x-schema', 'bbb');
    this.ctx.body = `${name},hello http world,${action}`;
  }
}
