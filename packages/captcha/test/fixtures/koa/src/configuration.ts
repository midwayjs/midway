import { Configuration, Controller, Inject, Post, Get } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { CaptchaService } from '../../../../src';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        captcha: {
          default: {
            noise: 4,
          },
          image: {
            size: 6,
          }
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

  @Inject()
  captchaService: CaptchaService;

  @Post('/text')
  async text() {
    const { text } = this.ctx.request.body;
    const id = await this.captchaService.set(text);
    return { id };
  }

  @Post('/check')
  async check() {
    const { id, code } = this.ctx.request.body;
    return this.captchaService.check(id, code);
  }

  @Get('/img')
  async img() {
    return this.captchaService.image();
  }

  @Get('/formula')
  async formula() {
    return this.captchaService.formula();
  }

  @Get('/text')
  async textCode() {
    return this.captchaService.text();
  }
}
