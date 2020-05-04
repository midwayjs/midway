import { func, inject, provide } from '@midwayjs/faas';

@provide()
@func('http.handler')
export class HelloHttpService {

  @inject()
  ctx;  // context

  async handler() {
    return 'http'
  }
}

@provide()
@func('http.xxx')
export class HelloXXXHttpService {

  @inject()
  ctx;  // context

  async handler() {
    return 'xxx'
  }
}