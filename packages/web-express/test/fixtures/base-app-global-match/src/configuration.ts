import { Configuration, App, Catch, Match } from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayExpressApplication } from '../../../../src';

@Catch()
@Match()
export class GlobalFilter {
  catch(err, req, res) {
    if (err) {
      return {
        status: 500,
        message: err.message,
      }
    }
  }

  match(value, req, res, next) {
    return {
      status: 200,
      data: {
        value
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

    this.app.useFilter([GlobalFilter]);
  }
}
