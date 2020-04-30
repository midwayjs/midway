import { inject, provide, func, FunctionHandler } from '../../../../src';

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx; // context

  handler(event) {
    return event.text + this.ctx.text + this.ctx.requestId;
  }
}
