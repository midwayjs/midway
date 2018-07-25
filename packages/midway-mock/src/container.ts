import {MidwayLoader} from 'midway-core';
import {Application} from 'egg';

class MidwayMockLoader extends MidwayLoader {

  loadCustomApp() {
    this.interceptLoadCustomApplication('app');
  }

  load() {
    this.loadApplicationContext();
    // app > plugin
    this.loadCustomApp();
    this.app.beforeStart(async () => {
      await this.refreshContext();
    });
  }

}

class MidwayApplication extends (<{
  new(...x)
}> Application) {

  get [Symbol.for('egg#loader')]() {
    return MidwayMockLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  get applicationContext() {
    return this.loader.applicationContext;
  }
}

export function mockContainer(options: {
  baseDir: string,
}) {
  const app = new MidwayApplication({
    baseDir: options.baseDir,
  });
  return {
    async ready() {
      await app.ready();
    }
  };
}
