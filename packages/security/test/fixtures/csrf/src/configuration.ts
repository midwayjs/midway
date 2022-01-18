import { Configuration, Controller, Inject, Post, Get } from '@midwayjs/decorator';
import * as framework from '${framework}';
import * as defaultConcig from './config/config.default';

@Configuration({
  imports: [
    framework,
    require('../../../../../src')
  ],
  importConfigs: [
    {
      default: defaultConcig
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
    return this.ctx.request?.body || this.ctx.body;
  }
}
