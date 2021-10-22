import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
