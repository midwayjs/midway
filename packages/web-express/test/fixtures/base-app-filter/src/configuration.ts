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
    this.app.useMiddleware((req, res, next) => {
      next();
    });
  }
}
