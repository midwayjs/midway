import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller()
export class HomeController {
  @Get('/render')
  async render(ctx) {
    return ctx.render('a.html');
  }

  @Get('/renderString')
  async renderString(ctx) {
    await ctx.renderString('').then(data => {
      ctx.body = data;
    });
  }
}
