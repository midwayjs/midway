import { inject, provide, func, FunctionHandler } from '../../../../src';

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx; // context

  handler(event) {
    throw new Error('test err');
  }
}
