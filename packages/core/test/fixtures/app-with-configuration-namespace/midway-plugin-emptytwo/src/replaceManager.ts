import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class ReplaceManagera {

  @Config('ok.text')
  config;

  async getOne() {
    return this.config + 'emptytwo';
  }
}
