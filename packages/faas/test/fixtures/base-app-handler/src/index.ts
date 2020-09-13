import { Inject, Provide, Func } from '@midwayjs/decorator';
import { FunctionHandler } from '../../../../src';

@Provide()
export class IndexService implements FunctionHandler {
  @Inject()
  ctx; // context

  @Func('index.entry')
  handler(event) {
    return event.text + this.ctx.text;
  }

  @Func('index.list', { event: 'HTTP', path: '/list' })
  getList(event) {
    return event.text + this.ctx.text;
  }
}
