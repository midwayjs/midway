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

@Provide()
export class Service2 {
  @Inject()
  ctx: FaaSContext;
  
  @Func({ event: 'HTTP', method: 'POST', path: '/api/test2' })
  async index() {
    return 'hello world'
  }
}