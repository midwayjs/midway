import { BasePlugin } from '../../src';

class Empty extends BasePlugin {
  commands = {
    test: {},
  };
  hooks = {};
}

export = Empty;
