import { BasePlugin } from '@midwayjs/fcli-command-core';
import { useKoaDevPack } from '@midwayjs/faas-dev-pack';
import * as koa from 'koa';
import * as onerror from 'koa-onerror';
export class DevPackPlugin extends BasePlugin {
  commands: {
    start: {
      usage: 'start a local http dev server';
      lifecycleEvents: ['start'];
      options: {
        port: {
          usage: 'dev server port [3000]';
          shortcut: 'p';
        };
        debug: {
          usage: 'debug mode';
          shortcut: 'd';
        };
      };
    };
  };
  hooks = {
    'start:start': this.handleStart.bind(this),
    'before:invoke:formatOptions': this.checkPort.bind(this),
  };

  async handleStart() {
    if (!this.options.port) {
      this.options.port = 3000;
    }
    await this.checkPort();
  }

  async checkPort() {
    if (this.options.clean === 'false' || this.options.clean === false) {
      process.env.MIDWAY_LOCAL_CLEAN = 'false';
    }
    if (this.options.port) {
      if (this.options.port === true) {
        this.options.port = 3000;
      } else {
        this.options.port = parseInt(this.options.port, 10);
      }
      const app = new koa();
      onerror(app);
      app.use(
        useKoaDevPack({
          functionDir: this.core.config.servicePath,
          sourceDir: this.options.sourceDir,
          verbose: this.options.V,
        })
      );
      app.listen(this.options.port, () => {
        console.log();
        this.core.cli.log(
          'start a server at http://127.0.0.1:' + this.options.port
        );
      });
      return new Promise(resolve => {});
    }
  }
}
