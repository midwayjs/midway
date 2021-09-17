import { Config, Provide, Inject} from '@midwayjs/decorator';

@Provide()
export class ReplaceManagerTwo {

  @Inject('ctx') hello: any;

  @Inject()
  ctx: any;

  @Config('ok.text')
  config;

  async getOne() {
    return this.config;
  }
}
