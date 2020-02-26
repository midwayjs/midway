import { Inject, Provide, Func, Handler } from '@midwayjs/decorator';
import { FunctionHandler } from '../../../../src';

@Provide()
@Func('index.handler')
export class IndexService implements FunctionHandler {
  @Inject()
  ctx; // context

  // index.handler default method
  handler(event) {
    return 'default' + event.text + this.ctx.text;
  }

  @Handler('index.list')
  getList(event) {
    return event.text + this.ctx.text;
  }
}
