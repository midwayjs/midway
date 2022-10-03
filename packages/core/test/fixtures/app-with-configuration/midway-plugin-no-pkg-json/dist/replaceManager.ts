import { Config, Provide } from '../../../../../src';

@Provide()
export class ReplaceManager {

  @Config('ok.text')
  config;

  async getOne() {
    return this.config;
  }
}
