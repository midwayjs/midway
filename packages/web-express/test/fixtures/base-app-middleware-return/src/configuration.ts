import { Configuration, App } from '@midwayjs/decorator';
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

  @App()
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
      next();
    });

    this.app.useMiddleware(async (req, res, next) => {
      if (req.path === '/info') {
        return 'hello world';
      } else {
        next();
      }
    });
  }
}
