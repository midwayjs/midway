import { Configuration, App } from '@midwayjs/core';
import { TestMiddleware } from './mw/test';

@Configuration({
})
export class AutoConfiguration {

  @MainApp()
  app;

  async onReady(container) {
    this.app.useMiddleware(TestMiddleware);
  }
}
