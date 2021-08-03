import { ALL, App, Config, Configuration, Inject, MidwayFrameworkType } from '@midwayjs/decorator';
import { join } from 'path';
import * as assert from 'assert';
import { RemoteConfigService } from './service/remoteConfigService';
import { getCurrentApplicationContext, getCurrentMainFramework, IMidwayApplication } from '@midwayjs/core';

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

  @App()
  app: IMidwayApplication;

  async onReady() {
    console.log('ready');
    assert(this.prepareConfig['prepare'] === 'remote data');
    assert(this.prepareConfig['id'] === this.configService.innerData);
    assert(getCurrentApplicationContext() === this.app.getApplicationContext());
    assert(getCurrentMainFramework().getFrameworkType() === MidwayFrameworkType.WEB);
  }
}
