import {MidwayLoader} from 'midway-core';

export class MidwayMockLoader extends MidwayLoader {

  loadCustomApp() {
    this.interceptLoadCustomApplication('app');
  }

  loadAll() {
    this.loadConfig();
    this.loadApplicationContext();
    this.loadCustomApp();
    this.refreshContext();
  }
}


export function mockContainer(options: {
  baseDir: string,
  framework
}) {
  const loader = new MidwayMockLoader({
    baseDir: options.baseDir,
    app: {},
    logger: console,
  });
  return loader.applicationContext;
}
