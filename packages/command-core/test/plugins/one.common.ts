import * as BasePlugin from '../../dist/plugin';

class OnePlugin extends BasePlugin {
  provider = 'one';
  commands = {
    common: {
      usage: 'common command',
      lifecycleEvents: ['main'],
    },
  };
  hooks = {
    'common:main': async () => {},
  };
}

export default OnePlugin;
