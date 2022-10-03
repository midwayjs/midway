import { Configuration, App } from '../../../../src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app: any;

  async onReady() {
    // this.app.keys = ['some secret hurr'];
    //
    // this.app?.use(session({
    //   key: 'koa.sess',
    //   maxAge: 86400000,
    //   httpOnly: true,
    // }, this.app));
    // this.app?.use(bodyParser());
  }
}
