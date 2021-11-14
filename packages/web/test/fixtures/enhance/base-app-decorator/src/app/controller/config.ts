import { Provide, Inject, Controller, Get, Config, Init } from '@midwayjs/decorator';

@Provide()
@Controller('/config')
export class ConfigController {

  @Inject('ctx')
  ctx: any;

  // should be 1
  @Config('hello.a')
  a: number;

  // should be 2
  @Config('hello.e.f')
  c: number;

  // should be undefined
  @Config('hello.f')
  d: number;

  @Config('plugins')
  plugins: any;

  b: boolean;

  @Config('plugins.plugin2')
  pluginFlag: boolean;

  @Init()
  async init() {
    this.b = this.pluginFlag;
  }

  @Get('/test')
  async test() {
      const data =  {
          a: this.a,
          b: this.b,
          c: this.c,
          d: this.d,
      };
      this.ctx.body = data;
  }

  @Get('/test2')
  async test2() {
      this.ctx.body = this.plugins;
  }
}
