import { Inject, Provide, Func, Handler } from '@midwayjs/decorator';
import { FunctionHandler } from '../../../../src';

@Provide()
@Func('')
export class IndexService implements FunctionHandler {
  @Inject()
  ctx; // context

  @Handler('index.entry')
  handler(event) {
    return event.text + this.ctx.text;
  }

  @Handler('index.list')
  getList(event) {
    return event.text + this.ctx.text;
  }
}
