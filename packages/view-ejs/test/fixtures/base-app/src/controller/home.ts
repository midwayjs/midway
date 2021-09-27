import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HomeController {
  @Get('/locals')
  async render(ctx) {
    return ctx.render('locals.ejs', {
      data: 'world',
    });
  }
}
