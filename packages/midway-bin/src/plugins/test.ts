import { BasePlugin } from '@midwayjs/fcli-command-core';

export class TestPlugin extends BasePlugin {
  commands: {
    test: {
      usage: 'Usage: midway-bin test [dir] [options]';
      lifecycleEvents: ['test'];
      options: {
        clean: {
          usage: 'clean build target dir';
          shortcut: 'c';
        };
      };
    };
  };
  hooks = {
    'test:test': this.runJestTest.bind(this),
  };

  async runJestTest() {

  }
}
