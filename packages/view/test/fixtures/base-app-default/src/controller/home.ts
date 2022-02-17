import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller()
export class HomeController {
  @Get('/render')
  async render(ctx) {
    return ctx.render('a');
  }
}
