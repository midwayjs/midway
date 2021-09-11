import { App, Provide, Scope, ScopeEnum, sleep } from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RemoteConfigService {

  @App()
  app: IMidwayApplication;

  innerData = Math.random();

  async getRemoteConfig() {
    await sleep(1000);
    const data = {
      prepare: 'remote data',
      id: this.innerData,
    }

    this.app.addConfigObject(data);
    return data;
  }
}
