import { BasePlugin } from '../../src';

class LogPlugin extends BasePlugin {
  provider = ['test'];
  commands = {
    log: {
      usage: 'log command',
      lifecycleEvents: ['main'],
    },
  };
  hooks = {
    'log:main': async () => {
      await this.core.invoke(['invoke']);
    },
  };
}

export default LogPlugin;
