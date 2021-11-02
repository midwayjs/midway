import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayExpressApplication, Context } from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.use((req: Context, res, next) => {
      console.log('invoke middleware in ready');
      next();
    });
  }
}
