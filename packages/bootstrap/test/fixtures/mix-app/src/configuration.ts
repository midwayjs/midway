import { ALL, MainApp, Config, Configuration, Inject } from '@midwayjs/core';
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

  @MainApp()
  app: IMidwayApplication;

  async onConfigLoad() {
    return this.configService.getRemoteConfig();
  }

  async onReady() {
    console.log('ready');
    assert.ok(this.prepareConfig['prepare'] === 'remote data');
    assert.ok(this.prepareConfig['id'] === this.configService.innerData);
    assert.ok(getCurrentApplicationContext() === this.app.getApplicationContext());
    assert.ok((getCurrentMainFramework() as any).getNamespace() === 'egg');
  }
}
