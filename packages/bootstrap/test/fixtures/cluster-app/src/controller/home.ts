import { Controller, Provide, Get, Post, Inject } from '@midwayjs/core';

@Provide()
@Controller()
export class HomeController {
  @Inject()
  ctx: any;

  @Get()
  async homeAPI() {
    return 'hello world';
  }

  @Post('/upload')
  async upload() {
    return { files: this.ctx.files };
  }
}
