
import { BasePlugin } from '../../src';

class StoreGet extends BasePlugin {
  commands = {
    store: {
      lifecycleEvents: ['main'],
    },
  };
  hooks = {
    'after:store:main': async () => {
      this.setStore('get', this.getStore('set', 'StoreSet'));
    },
  };
}

export default StoreGet;
