import { App, Configuration } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '../../../../../src';
import * as custom from './component/src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  imports: [
    custom,
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayWebApplication;

  async onReady() {
    console.log(`middleware - > globalMiddleware1`);
    this.app.use(await this.app.generateMiddleware('globalMiddleware1'));
  }
}
