import { Configuration, App, Plugin } from '@midwayjs/decorator';
import * as assert from 'assert';

@Configuration({
})
export class AutoConfiguration {

  @App()
  app;

  @Plugin()
  view;

  async onReady() {
    assert(this.view);
    assert(this.app.view === this.view);
  }
}
