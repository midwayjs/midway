import { App, Configuration } from '@midwayjs/decorator';
import { GlobalEventMiddleware, GlobalHttpMiddleware } from './test.middleware';

@Configuration({
  imports: []
})
export class AutoConfiguration {
  @App()
  app;

  async onReady() {
    this.app.useMiddleware(GlobalHttpMiddleware);
    this.app.useEventMiddleware(GlobalEventMiddleware);
  }
}
