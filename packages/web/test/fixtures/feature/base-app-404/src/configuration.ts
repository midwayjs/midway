import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @App()
  app: any;

  async onReady() {
    this.app.useMiddleware(async (ctx, next) => {
      return await next();
    });
  }
}
