import { Config, Provide, Inject, Init} from '@midwayjs/decorator';

@Provide()
export class ReplaceManager {
  hello;
  @Inject()
  ctx: any;

  @Config('ok.text')
  config;

  @Init()
  init() {
    this.hello = this.ctx;
  }

  async getOne() {
    return this.config;
  }
}
