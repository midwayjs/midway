import { FaaSContext, func, inject, provide } from '@midwayjs/faas';

@provide()
@func('index.handler')
export class HelloService {
  @inject()
  ctx: FaaSContext; // context

  async handler(event: any) {
    return 'hello world';
  }
}
