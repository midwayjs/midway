import { FaaSContext, func, inject, provide } from '@midwayjs/faas';

@provide()
@func('http.handler')
export class HelloHttpService {

  @inject()
  ctx: FaaSContext;  // context

  async handler() {
    return 'hello http world';
  }
}
