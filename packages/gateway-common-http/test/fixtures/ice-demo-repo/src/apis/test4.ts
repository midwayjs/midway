import {
  provide,
  func,
  FunctionHandler,
  inject,
  FaaSContext,
} from '@midwayjs/faas';

@provide()
@func('test4.handler')
export class Test4Handler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {
    this.ctx.body = {data: 'test4'};
  }
}
