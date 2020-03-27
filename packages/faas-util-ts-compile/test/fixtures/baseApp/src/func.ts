import { Inject, Func, Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';

const FaaSTrigger = {
  HTTP: 'HTTP',
  OSS: 'OSS'
};

@Provide()
export class Index {
  @Inject()
  ctx: FaaSContext;
  
  @Func({ event: FaaSTrigger.HTTP })
  async index() {
    return 'hello world'
  }
}

@Provide()
export class Index2 {
  @Inject()
  ctx: FaaSContext;
  
  @Func('index2.indexhandler')
  async index() {
    return 'hello world'
  }
}

@Provide()
export class MultiDeco {
  @Inject()
  ctx: FaaSContext;
  
  @Func({ event: FaaSTrigger.HTTP, path: '/api/test1' })
  @Func({ event: FaaSTrigger.HTTP, method: 'POST', path: '/api/test2' })
  @Func({ event: FaaSTrigger.OSS })
  async index() {
    return 'hello world'
  }
}