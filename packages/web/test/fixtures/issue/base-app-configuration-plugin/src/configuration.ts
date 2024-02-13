import { Configuration, App, Plugin } from '@midwayjs/core';
import * as assert from 'assert';

@Configuration({
})
export class AutoConfiguration {

  @App()
  app;

  @Plugin()
  view;

  async onReady() {
    assert.ok(this.view);
    assert.ok(this.app.view === this.view);
  }
}
