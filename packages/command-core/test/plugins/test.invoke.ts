import * as BasePlugin from '../../dist/plugin';

class Plugin extends BasePlugin {
  provider = 'test';
  commands = {
    invoke: {
      usage: 'test provider invoke',
      lifecycleEvents: ['one', 'two'],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f',
        },
      },
    },
  };
  hooks = {
    'before:invoke:one': () => {
      this.core.cli.log('before:invoke:one');
    },
    'invoke:one': async () => {
      this.core.cli.log('invoke:one');
    },
    'after:invoke:one': () => {
      this.core.cli.log('after:invoke:one');
    },
    'before:invoke:two': async () => {
      this.core.cli.log('before:invoke:two');
    },
    'invoke:two': () => {
      this.core.cli.log('invoke:two');
    },
    'after:invoke:two': async () => {
      this.core.cli.log('after:invoke:two');
    },
  };
}

export default Plugin;
