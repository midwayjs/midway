import {
  provide,
  func,
  FunctionHandler,
  inject,
  FaaSContext,
} from '@midwayjs/faas';

@provide()
@func('test6.handler')
export class Test6Handler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {
    this.ctx.body = {data: 'test6'};
  }
}
