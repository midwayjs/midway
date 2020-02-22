import { provide, inject } from 'injection';

// eslint-disable-next-line import/named
import { controller, get, config } from '../../../../../../../src';

@provide()
@controller('/config')
export class ConfigController {

  @inject('ctx')
  ctx: any;

  // should be 1
  @config('hello.a')
  a: number;

  // should be 2
  @config('hello.e.f')
  c: number;

  // should be undefined
  @config('hello.f')
  d: number;

  @config('plugins')
  plugins: any;

  b: boolean;

  constructor(
  // should be true
  @config('plugins.plugin2') pluginFlag: boolean,
  ) {
    this.b = pluginFlag;
  }

  @get('/test')
  async test() {
    const data = {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
    };
    this.ctx.body = data;
  }

  @get('/test2')
  async test2() {
    this.ctx.body = this.plugins;
  }
}
