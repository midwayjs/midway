import {MidwayLoader} from 'midway-core';
import * as path from 'path';

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

  getEggPaths() {
    const paths = super.getEggPaths();
    const defaultPaths = JSON.parse(process.env.MIDWAY_PATH);
    return paths.concat(defaultPaths).concat([
      path.dirname(__dirname),
    ]);
  }
}
