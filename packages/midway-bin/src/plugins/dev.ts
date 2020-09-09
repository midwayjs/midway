import { BasePlugin } from '@midwayjs/fcli-command-core';
import { createApp } from '@midwayjs/mock';

export class DevPlugin extends BasePlugin {
  commands: {
    dev: {
      usage: 'Usage: midway-bin dev [dir] [options]';
      lifecycleEvents: ['start'];
      options: {
        port: {
          usage: 'start your development server with port [7001]';
          shortcut: 'p';
        };
        debug: {
          usage: 'start debug mode';
          shortcut: 'd';
        };
      };
    };
  };
  hooks = {
    'start:start': this.handleStart.bind(this),
  };

  async handleStart() {
    if (!this.options.port) {
      this.options.port = 7001;
    }
    const app = await createApp();
    app.listen(this.options.port, () => {
      this.core.cli.log(
        'start a server at http://127.0.0.1:' + this.options.port
      );
    });
    return new Promise(resolve => {});
  }
}
