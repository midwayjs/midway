import { Configuration, App } from '@midwayjs/decorator';
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

  @App()
  app: Application;

  async onReady() {
    this.app.useMiddleware(async (ctx, next) => {
      return await next();
    });
  }
}
