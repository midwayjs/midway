import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayExpressApplication, IMidwayExpressRequest } from '../../../../src';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    require('../../../../src')
  ],
})
export class ContainerConfiguration {

  @App()
  app: IMidwayExpressApplication;

  async onReady() {
    this.app.use((req: IMidwayExpressRequest, res, next) => {
      console.log('invoke middleware in ready');
      next();
    });
  }
}
