import { Func, Inject, Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';

@Provide()
@Func('service.handler')
export class Service {

  @Inject()
  ctx: FaaSContext;  // context

  async handler() {
    return 'hello world';
  }
}