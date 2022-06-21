import { Configuration, App } from '@midwayjs/decorator';
import { TestMiddleware } from './mw/test';

@Configuration({
  importConfigs: [
  ],
})
export class AutoConfiguration {

  @App()
  app;

  async onReady(container) {
    container.registerObject('adb', { data: '123' });

    this.app.useMiddleware(TestMiddleware);
  }
}
