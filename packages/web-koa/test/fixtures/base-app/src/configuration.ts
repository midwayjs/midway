import { Configuration, App } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady() {
    this.app.keys = ['some secret hurr'];

    this.app.use(session({
      key: 'koa.sess',
      maxAge: 86400000,
      httpOnly: true,
    }, this.app));
    this.app.use(bodyParser());
  }
}
