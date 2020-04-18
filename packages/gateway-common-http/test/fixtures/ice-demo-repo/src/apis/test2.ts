import {
  provide,
  func,
  FunctionHandler,
  inject,
  FaaSContext,
} from '@midwayjs/faas';

@provide()
@func('test2.handler')
export class Test2Handler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {
    this.ctx.body = {data: 'test2'};
  }
}
