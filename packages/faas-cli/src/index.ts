const minimist = require('minimist');
const CoreClass = require('@midwayjs/command-core');
const { join } = require('path');
import { loadSpec } from './utils/loadSpec';
import CommandPlugin from './plugins/pluginManager';
import CommandInvoke from './plugins/invoke';
import CommandTest from './plugins/test';

const baseDir = process.cwd();
export * from './plugins/invoke/main';
export const InvokeClass = CommandInvoke;
export class Cli {
  argv: any;
  providerName: string;
  core: any;
  spec: any;
  commands: string[];
  constructor(argv) {
    this.argv = minimist(argv.slice(2));
    this.commands = [].concat(this.argv._);
    this.loadSpec();
    this.providerName = (this.spec.provider && this.spec.provider.name) || '';
    this.core = new CoreClass({
      config: {
        servicePath: baseDir,
      },
      commands: this.commands,
      service: this.spec,
      provider: this.providerName,
      options: this.argv,
      log: console,
    });
    this.loadDefaultPlugin();
    this.loadPlatformPlugin();
    this.loadUserPlugin();
  }

  loadDefaultPlugin() {
    this.loadCommandPlugin();
    this.loadCommandInvoke();
    this.loadCommandTest();
  }

  loadCommandPlugin() {
    this.core.addPlugin(CommandPlugin);
  }

  loadCommandInvoke() {
    this.core.addPlugin(CommandInvoke);
  }

  loadCommandTest() {
    this.core.addPlugin(CommandTest);
  }

  loadPlatformPlugin() {
    if (this.argv.skipPlatformPlugin || !this.spec.provider) {
      return;
    }
    this.core.addPlugin('npm::serverless-midway-plugin');
  }

  loadSpec() {
    this.spec = loadSpec(baseDir);
  }

  error(errMsg) {
    console.log('errMsg', errMsg);
    process.exit(1);
  }

  loadUserPlugin() {
    if (!this.spec || !this.spec.plugins) {
      return;
    }
    for (const plugin of this.spec.plugins) {
      if (/^npm:/.test(plugin) || /^local:/.test(plugin)) {
        this.core.addPlugin(plugin);
      } else if (/^\./.test(plugin)) {
        this.core.addPlugin(`local:${this.providerName}:${plugin}`);
      } else {
        const localPlugin = this.loadRelativePlugin(
          '.serverless_plugins',
          plugin
        );
        if (!localPlugin) {
          this.loadRelativePlugin('node_modules', plugin);
        }
      }
    }
  }

  loadRelativePlugin(dirPath, path) {
    try {
      const localPlugin = require(join(baseDir, dirPath, path));
      this.core.addPlugin(localPlugin);
      return true;
    } catch (e) {
      return false;
    }
  }

  async start() {
    await this.core.ready();
    await this.core.invoke();
  }
}
