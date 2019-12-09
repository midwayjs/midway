import { FaaSContext, func, inject, provide } from '../../../../../faas';

@provide()
@func('http.handler')
export class HelloHttpService {

  @inject()
  ctx: FaaSContext;  // context

  async handler() {
    return 'hello http world';
  }
}
