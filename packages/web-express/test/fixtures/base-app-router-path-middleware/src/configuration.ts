import { Configuration, App } from '@midwayjs/core';
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

    this.app.get('/user/:id', function (req, res, next) {
      res.send('USER');
    });

    this.app.useMiddleware('/user/:id', function(req, res, next) {
      console.log('Request URL:', req.originalUrl);
      next();
    }, function (req, res, next) {
      next();
    });
  }
}
