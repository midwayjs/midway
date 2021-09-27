import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HomeController {
  @Get('/render')
  async render(ctx) {
    return ctx.render('a.html');
  }

  @Get('/renderString')
  async renderString(ctx) {
    ctx.renderString('').then(data => (ctx.body = data));
  }
}
