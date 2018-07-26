import {MidwayMockApplication} from './application';
import {MidwayMockLoader} from './loader';
import {MidwayContainer} from 'midway-core';


export class MidwayMockContainer extends MidwayContainer {

  options;
  loader;

  constructor(options) {
    super();
    this.options = options;
    this.loader = new MidwayMockLoader(Object.assign(options, {
      container: this
    }));
    this.loader.load();
  }

  async ready() {
    this.load({
      loadDir: this.options.baseDir
    });
    await super.ready();
  }

}

export function mockContainer(options: {
  baseDir: string,
}) {
  const app = new MidwayMockApplication(options);
  return new MidwayMockContainer({
    baseDir: options.baseDir,
    app,
    logger: console
  });
}
