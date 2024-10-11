import { Configuration, MainApp } from '@midwayjs/core';
import { join } from 'path';
import { IMidwayExpressApplication } from '../../../../src';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @MainApp()
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.useMiddleware(async (req, res, next) => {
      next();
    });
  }
}
