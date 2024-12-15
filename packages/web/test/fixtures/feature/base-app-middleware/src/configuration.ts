import { MainApp, Configuration, CommonJSFileDetector } from '@midwayjs/core';
import { IMidwayWebApplication } from '../../../../../src';
import * as custom from './component/src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  imports: [
    custom,
  ],
  detector: new CommonJSFileDetector({
    ignore: [
      '**/component/**',
    ]
  }),
})
export class ContainerConfiguration {

  @MainApp()
  app: IMidwayWebApplication;

  async onReady() {
    console.log(`middleware - > globalMiddleware1`);
    this.app.use(await this.app.generateMiddleware('globalMiddleware1'));
  }
}
