import {
  provide,
  func,
  FunctionHandler,
  inject,
  FaaSContext,
} from '@midwayjs/faas';

@provide()
@func('test3.handler')
export class Test3Handler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {
    this.ctx.body = {data: 'test3'};
  }
}
