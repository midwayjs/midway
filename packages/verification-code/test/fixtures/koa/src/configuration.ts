import { Configuration, Controller, Inject, Post } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { VerificationCodeService } from '../../../../src';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
      }
    }
  ]
})
export class AutoConfiguration {}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Inject()
  verificationCodeService: VerificationCodeService;

  @Post('/text')
  async text() {
    const { text } = this.ctx.request.body;
    return this.verificationCodeService.set(text);
  }

  @Post('/check')
  async check() {
    const { id, code } = this.ctx.request.body;
    return this.verificationCodeService.check(id, code);
  }

  @Get('/img')
  async img() {
    return this.verificationCodeService.image();
  }
}
