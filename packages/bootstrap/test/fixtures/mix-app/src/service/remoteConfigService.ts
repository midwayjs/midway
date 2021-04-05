import { Provide, sleep } from '@midwayjs/decorator';

@Provide()
export class RemoteConfigService {

  innerData = Math.random();

  async getRemoteConfig() {
    await sleep(1000);
    return {
      prepare: 'remote data',
      id: this.innerData,
    }
  }
}
