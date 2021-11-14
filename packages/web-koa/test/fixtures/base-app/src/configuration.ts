import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { join } from 'path';
import { Framework } from '../../../../src';
import * as Validate from '@midwayjs/validate';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    Validate
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
    this.app.keys = ['some secret hurr'];

    this.framework.useMiddleware(session({
      key: 'koa.sess',
      maxAge: 86400000,
      httpOnly: true,
    }, this.app));

    this.framework.useMiddleware(bodyParser());
  }
}
