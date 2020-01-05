import * as minimist from 'minimist';
import { join } from 'path';
import { loadSpec } from './utils/loadSpec';
import { CommandHookCore } from './core';
import { PluginManager } from './pluginManager';

export class BaseCLI {
  argv: any;
  providerName: string;
  core: any;
  spec: any;
  commands: string[];
  cwd;

  constructor(argv) {
    this.argv = minimist(argv.slice(2));
    this.commands = [].concat(this.argv._);
    this.loadSpec();
    this.providerName = (this.spec.provider && this.spec.provider.name) || '';
    this.cwd = process.cwd();
    this.core = new CommandHookCore({
      config: {
        servicePath: this.cwd,
      },
      commands: this.commands,
      service: this.spec,
      provider: this.providerName,
      options: this.argv,
      log: this.loadLog(),
      extensions: this.loadExtensions(),
    });
    this.loadCorePlugin();
    this.loadDefaultPlugin();
    this.loadPlatformPlugin();
    this.loadUserPlugin();
  }

  loadCorePlugin() {
    this.core.addPlugin(PluginManager);
  }

  // 加载默认插件
  loadDefaultPlugin() {}

  // 加载平台方插件
  loadPlatformPlugin() {}

  // 加载cli拓展
  loadExtensions() {
    return {};
  }

  loadSpec() {
    this.spec = loadSpec(this.cwd);
  }

  // 加载命令行输出及报错
  loadLog() {
    return console;
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
      }
    }
  }

  loadRelativePlugin(dirPath, path) {
    try {
      const localPlugin = require(join(this.cwd, dirPath, path));
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
