import { Configuration, Controller, Inject, Post, Get } from '@midwayjs/core';
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


  @Inject()
  res

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

  @Get('/')
  async main() {
    return 123;
  }

  @Get('/redirect')
  async redirect() {
    if (this.res?.redirect) {
      this.res.redirect('/');
    } else {
      this.ctx.redirect('/');
    }
  }

  @Get('/csp')
  async csp() {
    return this.ctx.nonce;
  }
}
