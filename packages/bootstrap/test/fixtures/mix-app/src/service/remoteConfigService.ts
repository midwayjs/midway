import { Provide, sleep } from '@midwayjs/decorator';

@Provide()
export class RemoteConfigService {
  async getRemoteConfig() {
    await sleep(1000);
    return {
      prepare: 'remote data',
    }
  }
}
