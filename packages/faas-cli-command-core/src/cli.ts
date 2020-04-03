import * as minimist from 'minimist';
import { join } from 'path';
import { loadSpec, getSpecFile } from './utils/loadSpec';
import { commandLineUsage } from './utils/commandLineUsage';
import { CommandHookCore } from './core';
import { PluginManager } from './pluginManager';

export class BaseCLI {
  argv: any;
  providerName: string;
  core: any;
  spec: any;
  specFile: any;
  commands: string[];
  cwd = process.cwd();

  constructor(argv) {
    if (Array.isArray(argv)) {
      this.argv = minimist(argv.slice(2));
    } else {
      this.argv = argv;
    }
    this.commands = [].concat(this.argv._);
    this.loadSpec();
    this.providerName = (this.spec.provider && this.spec.provider.name) || '';
    this.core = new CommandHookCore({
      config: {
        servicePath: this.cwd,
        specFile: this.specFile
      },
      commands: this.commands,
      service: this.spec,
      provider: this.providerName,
      options: this.argv,
      log: this.loadLog(),
      displayUsage: this.displayUsage.bind(this),
      extensions: this.loadExtensions(),
      ...this.coverCoreOptions(),
    });
  }

  async loadPlugins() {
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

  // 覆盖默认的 core options
  coverCoreOptions() {
    return {};
  }

  loadSpec() {
    this.specFile = getSpecFile(this.cwd);
    this.spec = loadSpec(this.cwd, this.specFile);
  }

  // 加载命令行输出及报错
  loadLog() {
    return { ...console, error: this.error };
  }

  // 展示帮助信息
  displayUsage(commandsArray, usage, coreInstance) {
    const log = this.loadLog();
    let commandList: any = {};
    if (commandsArray && commandsArray.length) {
      commandList = {
        header: commandsArray.join(' '),
        optionList: Object.keys(usage || {}).map(name => {
          const usageInfo = usage[name] || {};
          return {
            name,
            description: usageInfo.usage,
            alias: usageInfo.shortcut,
          };
        }),
      };
    } else {
      commandList = [];
      coreInstance.instances.forEach(plugin => {
        if (plugin.commands) {
          Object.keys(plugin.commands).forEach(command => {
            const commandInfo = plugin.commands[command];
            if (!commandInfo || !commandInfo.lifecycleEvents) {
              return;
            }
            commandList.push({
              header: command,
              content: commandInfo.usage,
              optionList: Object.keys(commandInfo.options || {}).map(name => {
                const usageInfo = commandInfo.options[name] || {};
                return {
                  name,
                  description: usageInfo.usage,
                  alias: usageInfo.shortcut,
                };
              }),
            });
          });
        }
      });
    }
    log.log(commandLineUsage(commandList));
  }

  error(err) {
    console.error((err && err.message) || err);
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
    await this.loadPlugins();
    await this.core.ready();
    await this.core.invoke();
  }
}
