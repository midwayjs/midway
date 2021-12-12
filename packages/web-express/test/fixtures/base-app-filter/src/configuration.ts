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
    const bodyParser = require('body-parser');

    this.app.useMiddleware(bodyParser.json());
    this.app.useMiddleware(bodyParser.urlencoded({ extended: true }));
    this.app.useMiddleware((req, res, next) => {
      next();
    });
  }
}
