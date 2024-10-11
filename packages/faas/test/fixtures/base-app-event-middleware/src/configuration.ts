import { MainApp, Configuration } from '@midwayjs/core';
import { GlobalEventMiddleware, GlobalHttpMiddleware } from './test.middleware';

@Configuration({
  imports: []
})
export class AutoConfiguration {
  @MainApp()
  app;

  async onReady() {
    this.app.useMiddleware(GlobalHttpMiddleware);
    this.app.useEventMiddleware(GlobalEventMiddleware);
  }
}
