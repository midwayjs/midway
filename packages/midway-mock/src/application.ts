import {EggCore} from 'egg-core';
import {MidwayMockLoader} from './loader';

export class MidwayMockApplication extends EggCore {

  options;

  get [Symbol.for('egg#loader')]() {
    return MidwayMockLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  get applicationContext() {
    return this.options.applicationContext;
  }

}
