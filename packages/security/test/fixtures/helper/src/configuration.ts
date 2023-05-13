import { Configuration, Controller, Inject, Get } from '@midwayjs/core';
import * as framework from '@midwayjs/koa';
@Configuration({
  imports: [
    framework,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ['a']
      }
    }
  ]
})
export class AutoConfiguration {}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get('/html')
  async html() {
    return this.ctx.security.html('<script>alert(1)</script>');
  }

  @Get('/escape')
  async escape() {
    return this.ctx.security.escape('foo & bar');
  }
}
