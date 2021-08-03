import { App, Configuration } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '../../../../../../../src';

@Configuration({
  namespace: 'bbb'
})
export class ContainerConfiguration {

  @App()
  app: IMidwayWebApplication;

  async onReady() {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.app.use(async (ctx, next) => {
          ctx.state.e = '5555';
          await next();
        });
        resolve();
      }, 1000);
    })
  }
}
