import { inject, provide, func, FunctionHandler, IMidwayFaaSApplication } from '../../../../src';
import { App } from '@midwayjs/decorator';

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx; // context

  @App()
  app: IMidwayFaaSApplication;

  handler(event) {
    return this.ctx.originContext['text'] + event.text + this.ctx.requestId + this.app.getFunctionName() + this.app.getFunctionServiceName();
  }
}
