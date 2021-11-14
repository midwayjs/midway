import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwaySocketIOFramework } from './framework';

@Configuration({
  namespace: 'socketIO',
})
export class SocketIOConfiguration {
  @Inject()
  framework: MidwaySocketIOFramework;

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
