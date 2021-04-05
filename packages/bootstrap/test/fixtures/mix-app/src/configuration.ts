import { Configuration, Config, ALL, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as assert from 'assert';
import { RemoteConfigService } from './service/remoteConfigService';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
})
export class AutoConfiguration {
  @Config(ALL)
  prepareConfig;

  @Inject()
  configService: RemoteConfigService;

  async onReady() {
    console.log('ready');
    assert(this.prepareConfig['prepare'] === 'remote data');
    assert(this.prepareConfig['id'] === this.configService.innerData);
  }
}
