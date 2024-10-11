import { Configuration, MainApp } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @MainApp()
  app: any;

  async onReady() {
    this.app.useMiddleware(async (ctx, next) => {
      return await next();
    });
  }
}
