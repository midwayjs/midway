import { Configuration, App } from '@midwayjs/decorator';
import { TestMiddleware } from './mw/test';

@Configuration({
})
export class AutoConfiguration {

  @App()
  app;

  async onReady(container) {
    this.app.useMiddleware(TestMiddleware);
  }
}
