import {MidwayMockApplication} from './application';
import {MidwayContainer} from 'midway-core';


export class MidwayMockContainer extends MidwayContainer {

  options;
  loader;
  app;

  constructor(options) {
    super();
    this.options = options;
    this.app = new MidwayMockApplication(Object.assign(options, {
      applicationContext: this
    }));
    this.app.loader.load();
  }

  async ready() {
    const container = this.options.container;
    if (!container.disableAutoLoad) {
      this.load({
        loadDir: this.options.baseDir
      });
    }
    await this.app.ready();
    await super.ready();
  }

}

export function mockContainer(options: {
  baseDir: string,
}) {
  return new MidwayMockContainer(options);
}
