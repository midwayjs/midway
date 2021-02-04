import { App, Configuration } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '../../../../../src';
import * as custom from './component/src';

@Configuration({
  importConfigs: [
    './config'
  ],
  imports: [
    custom,
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayWebApplication;

  async onReady() {
    this.app.use(await this.app.generateMiddleware('globalMiddleware1'));
  }
}
