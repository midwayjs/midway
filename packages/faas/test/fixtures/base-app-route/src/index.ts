import { inject, provide, func, FunctionHandler } from '../../../../src';

@provide()
@func('deploy.handler9')
export class HelloService implements FunctionHandler {

  @inject()
  ctx;  // context

  handler(event) {
    return event.text + this.ctx.text;
  }
}
