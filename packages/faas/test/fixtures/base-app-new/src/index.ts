import { Inject, Provide, Func } from '@midwayjs/decorator';
import { FunctionHandler } from '../../../../src';

@Provide()
@Func('index.handler', {
  middleware: ['auth'],
})
export class HelloService implements FunctionHandler {
  @Inject()
  ctx: any; // context

  async handler(event) {
    return event.text + this.ctx.text;
  }
}
