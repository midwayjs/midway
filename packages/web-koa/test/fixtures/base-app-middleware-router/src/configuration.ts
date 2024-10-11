import { Configuration, App } from '@midwayjs/core';
import { join } from 'path';
import { Application } from '../../../../src';

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
  app: Application;

  async onReady() {
    this.app.useMiddleware(async (ctx, next) => {
      ctx.body = 'abc';
      return await next();
    });
  }
}
