import { Configuration, Config, ALL } from '@midwayjs/decorator';
import { join } from 'path';
import * as assert from 'assert';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
})
export class AutoConfiguration {
  @Config(ALL)
  prepareConfig;

  async onReady() {
    console.log('ready');
    assert(this.prepareConfig['prepare'] === 'remote data');
  }
}
