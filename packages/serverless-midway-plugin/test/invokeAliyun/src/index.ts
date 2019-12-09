import { FaaSContext, func, inject, provide } from '../../../../faas';

@provide()
@func('index.handler')
export class HelloService {

  @inject()
  ctx: FaaSContext;  // context

  async handler(event, obj = {}) {
      return 'hello world';
  }
}
