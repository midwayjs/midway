import { BasePlugin } from '@midwayjs/fcli-command-core';

export class CovPlugin extends BasePlugin {
  commands: {
    test: {
      usage: 'Usage: midway-bin cov [dir] [options]';
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
    'cov:cov': this.runJestCov.bind(this),
  };

  async runJestCov() {

  }
}
