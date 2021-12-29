import { Configuration, App, Catch } from '@midwayjs/decorator';
import { join } from 'path';
import { Application } from '../../../../src';

@Catch()
export class GlobalError {
  catch(err, ctx) {
    if (err) {
      return {
        status: err.status ?? 500,
        message: err.message,
      }
    }
  }
}

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

    this.app.useFilter([GlobalError]);
  }
}
