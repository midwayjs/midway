import { Configuration, App, Catch } from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayExpressApplication } from '../../../../src';

@Catch()
export class GlobalError {
  catch(err, req, res) {
    if (err) {
      return {
        status: 500,
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
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
      next();
    });

    this.app.useFilter([GlobalError]);
  }
}
