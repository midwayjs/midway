import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class ReplaceManager {

  @Config('ok.text')
  config;

  async getOne() {
    return this.config + 'empty';
  }
}
