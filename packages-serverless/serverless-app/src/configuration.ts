import { Configuration, Inject } from '@midwayjs/decorator';
import * as FaaS from '@midwayjs/faas';
import { ServerlessAppFramework } from './framework';

@Configuration({
  namespace: 'serverless-app',
  imports: [FaaS],
})
export class ServerlessAppConfiguration {
  @Inject()
  framework: ServerlessAppFramework;

  async onServerReady() {
    await this.framework.run();
  }
}
