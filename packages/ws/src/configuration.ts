import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwayWSFramework } from './framework';

@Configuration({
  namespace: 'webSocket',
  importConfigs: [
    {
      default: {
        webSocket: {},
      },
    },
  ],
})
export class WebSocketConfiguration {
  @Inject()
  framework: MidwayWSFramework;

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
