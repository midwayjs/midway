import {EggCore} from 'egg-core';
import {MidwayMockLoader} from './loader';

export class MidwayMockApplication extends EggCore {

  options;
  loader: MidwayMockLoader;
  ready: () => Promise<void>;
  beforeStart: (fn: any) => void;

  get [Symbol.for('egg#loader')]() {
    return MidwayMockLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  getPlugin(pluginName) {
    return this.getPluginContext().get(pluginName);
  }

  getPluginContext() {
    return this.loader.pluginContext;
  }

  getApplicationContext() {
    return this.loader.applicationContext;
  }
}
