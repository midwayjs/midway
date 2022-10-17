import { Configuration, Controller, Inject, Post, Get } from '@midwayjs/core';
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
    const id = await this.verificationCodeService.set(text);
    return { id };
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

  @Get('/formula')
  async formula() {
    return this.verificationCodeService.formula();
  }

  @Get('/text')
  async textCode() {
    return this.verificationCodeService.text();
  }
}
