import { MainApp, Configuration } from '@midwayjs/core';
import { TestMiddleware } from './mw/test';

@Configuration({
})
export class AutoConfiguraion {
  @MainApp()
  app;
  async onReady(container) {
    container.registerObject('adb', { data: '123' });
    this.app.useMiddleware(TestMiddleware);
  }
}
