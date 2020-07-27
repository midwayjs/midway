import { FaaSContext, func, inject, provide } from '@midwayjs/faas';

@provide()
export class HelloService {

  @inject()
  ctx: FaaSContext;  // context

  @func('index.handler')
  async handler(event, obj = {}) {
    return 'hello world';
  }

  @func('apiall.handler')
  async apiall(event, obj = {}) {
    return 'apiall:' + this.ctx.path;
  }

  @func('api1.handler')
  async api1(event, obj = {}) {
    return 'api1:' + this.ctx.path;;
  }

  @func('api2.handler')
  async api2(event, obj = {}) {
    return 'api2:' + this.ctx.path;;
  }

  @func('api3.handler')
  async api3(event, obj = {}) {
    return 'api3:' + this.ctx.path;;
  }

  @func('render.handler')
  async render(event, obj = {}) {
    return 'render:' + this.ctx.path;;
  }

  @func('render1.handler')
  async render1(event, obj = {}) {
    return 'render1:' + this.ctx.path;;
  }

  @func('render2.handler')
  async render2(event, obj = {}) {
    return 'render2:' + this.ctx.path;;
  }

  @func('normal1.handler')
  async normal1(event, obj = {}) {
    return 'normal1:' + this.ctx.path;;
  }

  @func('normal2.handler')
  async normal2(event, obj = {}) {
    return 'normal2:' + this.ctx.path;;
  }
}
