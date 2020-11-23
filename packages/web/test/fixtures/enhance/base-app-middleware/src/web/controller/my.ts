import { Inject, Provide, Controller, Get, Post } from '@midwayjs/decorator';

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

@Provide()
@Controller('/', {middleware: ['homeMiddleware', mw]})
export class My {

  @Inject()
  ctx;

  @Get('/', {middleware: ['apiMiddleware', newMiddleware('5555')]})
  @Post('/api/data')
  async index() {
    this.ctx.body = this.ctx.home + (this.ctx.api || '');
  }
}
