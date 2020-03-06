import { BasePlugin } from '../../src';

class StoreSet extends BasePlugin {
  commands = {
    store: {
      lifecycleEvents: ['main'],
    },
  };
  hooks = {
    'store:main': async () => {
      this.setStore('set', 123456);
    },
  };
}

export default StoreSet;
