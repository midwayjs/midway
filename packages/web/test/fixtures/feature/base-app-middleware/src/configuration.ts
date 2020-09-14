import { App, Configuration } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '../../../../../src';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayWebApplication;

  async onReady() {
    this.app.use(await this.app.generateMiddleware('globalMiddleware1'));
  }
}
