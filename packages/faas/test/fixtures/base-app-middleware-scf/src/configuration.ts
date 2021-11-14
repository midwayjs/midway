import { App, Configuration } from '@midwayjs/decorator';
import { TestMiddleware } from './mw/test';

@Configuration({
})
export class AutoConfiguraion {
  @App()
  app;
  async onReady(container) {
    container.registerObject('adb', { data: '123' });
    this.app.useMiddleware(TestMiddleware);
  }
}
