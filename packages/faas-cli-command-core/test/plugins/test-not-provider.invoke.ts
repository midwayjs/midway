import { BasePlugin } from '../../src';

export class PluginTest2 extends BasePlugin {
  provider = 'test2';
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
