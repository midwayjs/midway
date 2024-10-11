import { Configuration, MainApp, Plugin } from '@midwayjs/core';
import * as assert from 'assert';

@Configuration({
})
export class AutoConfiguration {

  @MainApp()
  app;

  @Plugin()
  view;

  async onReady() {
    assert.ok(this.view);
    assert.ok(this.app.view === this.view);
  }
}
