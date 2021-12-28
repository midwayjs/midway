import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayExpressApplication } from '../../../../src';
import { httpError } from '@midwayjs/core';

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
      if (req.path === '/error') {
        throw new httpError.BadRequestError('abc');
      } else {
        next();
      }
    });

    this.app.useMiddleware(async (req, res, next) => {
      next();
    });
  }
}
