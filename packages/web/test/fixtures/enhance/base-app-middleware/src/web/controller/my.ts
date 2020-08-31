import { inject, provide, controller, get, post } from '../../../../../../../src/';

const mw = async (ctx, next) => {
  ctx.home = ctx.home + '4444';
  await next();
};

const newMiddleware = (data) => {
  return async (ctx, next) => {
    ctx.home = ctx.home + data;
    await next();
  };
};

@provide()
@controller('/', {middleware: ['homeMiddleware', mw]})
export class My {

  @inject()
  ctx;

  @get('/', {middleware: ['apiMiddleware', newMiddleware('5555')]})
  @post('/api/data')
  async index() {
    this.ctx.body = this.ctx.home + (this.ctx.api || '');
  }
}
