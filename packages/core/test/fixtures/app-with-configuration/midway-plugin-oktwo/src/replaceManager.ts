import { Config, Provide, Inject} from '../../../../../src';

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
