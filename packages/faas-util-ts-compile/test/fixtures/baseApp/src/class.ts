import { Inject, Func, Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';

const FaaSTrigger = {
  HTTP: 'HTTP',
};

@Provide()
@Func({ event: FaaSTrigger.HTTP })
export class NoHandlerAndPath {
  @Inject()
  ctx: FaaSContext;

  async handler() {
    return 'hello world';
  }
}

@Provide()
@Func('test.handler')
export class NoEvents {
  @Inject()
  ctx: FaaSContext;

  async handler() {
    return 'hello world';
  }
}

@Provide()
@Func('test2.handler')
export class Test2Events {
  @Inject()
  ctx: FaaSContext;

  async handler() {
    return 'hello world';
  }
}
