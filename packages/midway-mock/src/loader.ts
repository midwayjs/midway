import {MidwayHandlerKey, MidwayLoader} from 'midway-core';

export class MidwayMockLoader extends MidwayLoader {

  constructor(options) {
    super(options);
    this.applicationContext = this.options.app.applicationContext;
  }

  loadCustomApp() {
    this.interceptLoadCustomApplication('app');
  }

  load() {
    this.loadConfig();
    this.loadApplicationContext();
    // app > plugin
    this.loadCustomApp();
    this.app.beforeStart(async () => {
      await this.pluginContext.ready();
    });
  }

  protected loadApplicationContext() {
    // register handler for container
    this.applicationContext.registerDataHandler(MidwayHandlerKey.CONFIG, (key) => {
      return this.config[key];
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.PLUGIN, (key) => {
      return this.pluginContext.get(key);
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.LOGGER, (key) => {
      return this.app.getLogger(key);
    });
  }

}
