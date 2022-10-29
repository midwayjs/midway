import { ALL, App, Config, Configuration, Inject, MidwayFrameworkType } from '@midwayjs/core';
import { join } from 'path';
import * as assert from 'assert';
import { RemoteConfigService } from './service/remoteConfigService';
import { getCurrentApplicationContext, getCurrentMainFramework, ILifeCycle, IMidwayApplication } from '@midwayjs/core';
import * as Web from '../../../../../web';
import * as SocketIO from '../../../../../socketio';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  imports: [
    Web,
    SocketIO,
  ]
})
export class AutoConfiguration implements ILifeCycle {
  @Config(ALL)
  prepareConfig;

  @Inject()
  configService: RemoteConfigService;

  @App()
  app: IMidwayApplication;

  async onConfigLoad() {
    return this.configService.getRemoteConfig();
  }

  async onReady() {
    console.log('ready');
    assert(this.prepareConfig['prepare'] === 'remote data');
    assert(this.prepareConfig['id'] === this.configService.innerData);
    assert(getCurrentApplicationContext() === this.app.getApplicationContext());
    assert((getCurrentMainFramework() as any).getFrameworkType() === MidwayFrameworkType.WEB);
  }
}
