import { Configuration, App } from '@midwayjs/decorator';
import { IMidwayExpressApplication, IMidwayExpressRequest } from '../../../../src';

@Configuration({
  importConfigs: [
    './config'
  ]
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
