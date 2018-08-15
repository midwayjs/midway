import {MidwayLoader} from 'midway-core';

export class MidwayMockLoader extends MidwayLoader {

  loadCustomApp() {
    this.interceptLoadCustomApplication('app');
  }

  load() {
    this.loadConfig();
    this.loadApplicationContext();
    // app > plugin
    this.loadCustomApp();
    this.app.beforeStart(async () => {
      await this.refreshContext();
    });
  }
}
