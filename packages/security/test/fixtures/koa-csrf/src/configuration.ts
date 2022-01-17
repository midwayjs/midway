import { Configuration, Controller, Inject, Post, Get } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        upload: {
          mode: 'file',
        }
      }
    }
  ]
})
export class AutoConfiguration {}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get('/csrf')
  @Post('/csrf')
  async csrf() {
    return this.ctx.csrf;
  }

  @Get('/rotate')
  async rotate() {
    this.ctx.rotateCsrfSecret();
    return this.ctx.csrf;
  }

  @Post('/body')
  async body() {
    return this.ctx.request.body;
  }
}
