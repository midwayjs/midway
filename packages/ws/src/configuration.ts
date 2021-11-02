import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwayWSFramework } from './framework';

@Configuration({
  namespace: 'webSocket',
})
export class SocketIOConfiguration {
  @Inject()
  framework: MidwayWSFramework;

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
