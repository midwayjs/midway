import { Configuration, App } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { join } from 'path';
import { IMidwayKoaApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayKoaApplication;

  async onReady(container) {
    this.app.keys = ['some secret hurr'];

    this.app.useMiddleware(session({
      key: 'koa.sess',
      maxAge: 86400000,
      httpOnly: true,
    }, this.app));
    this.app.useMiddleware(bodyParser());
  }
}
