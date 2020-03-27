import { Config, Provide, Inject} from '@midwayjs/decorator';

@Provide()
export class ReplaceManager {
  hello;
  constructor(@Inject() ctx: any) {
    this.hello = ctx;
  }
  @Inject()
  ctx: any;

  @Config('ok.text')
  config;

  async getOne() {
    return this.config;
  }
}
