import { Application } from 'egg';
import { MidwayMockLoader } from './loader';

export class MidwayMockApplication  extends (<{
  new(...x)
}> Application) {

  loader: MidwayMockLoader;

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
