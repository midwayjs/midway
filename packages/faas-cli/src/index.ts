import { BaseCLI, getSpecFile } from '@midwayjs/fcli-command-core';
import { saveYaml } from '@midwayjs/serverless-spec-builder';
import { execSync } from 'child_process';

const plugins = {
  create: { mod: '@midwayjs/fcli-plugin-create', name: 'CreatePlugin' },
  invoke: { mod: '@midwayjs/fcli-plugin-invoke', name: 'InvokePlugin' },
  test: { mod: '@midwayjs/fcli-plugin-test', name: 'TestPlugin' },
  package: [
    { mod: '@midwayjs/fcli-plugin-package', name: 'PackagePlugin' },
    { mod: '@midwayjs/fcli-plugin-fc', name: 'AliyunFCPlugin' },
  ],
  deploy: [
    { mod: '@midwayjs/fcli-plugin-deploy', name: 'DeployPlugin' },
    { mod: '@midwayjs/fcli-plugin-fc', name: 'AliyunFCPlugin' },
  ],
};

const { Select } = require('enquirer');
export class CLI extends BaseCLI {
  loadDefaultPlugin() {
    const command = this.commands && this.commands[0];
    // version not load plugin
    if (this.argv.v || this.argv.version) {
      return;
    }
    let needLoad = [];
    if (!this.argv.h && command) {
      if (plugins[command]) {
        needLoad = needLoad.concat(plugins[command]);
      }
    } else {
      // load all
      Object.keys(plugins).forEach((cmd: string) => {
        needLoad = needLoad.concat(plugins[cmd]);
      });
    }
    needLoad.forEach(pluginInfo => {
      try {
        const mod = require(pluginInfo.mod);
        if (mod[pluginInfo.name]) {
          this.core.addPlugin(mod[pluginInfo.name]);
        }
      } catch (e) {}
    });
  }

  async loadPlugins() {
    await this.checkProvider();
    await this.loadDefaultOptions();
    await super.loadPlugins();
  }

  async loadDefaultOptions() {
    if (this.commands.length) {
      return;
    }

    if (this.argv.v || this.argv.version) {
      this.displayVersion();
    } else {
      // 默认没有command的时候展示帮助
      this.argv.h = true;
    }
  }

  displayVersion() {
    const log = this.loadLog();
    try {
      const nodeVersion = execSync('node -v')
        .toString()
        .replace('\n', '');
      log.log('Node.js'.padEnd(20) + nodeVersion);
    } catch (E) {}

    try {
      // midway-faas version
      const cliVersion = require('../package.json').version;
      log.log('@midwayjs/faas-cli'.padEnd(20) + `v${cliVersion}`);
    } catch (E) {}
  }

  displayUsage(commandsArray, usage, coreInstance) {
    this.displayVersion();
    super.displayUsage(commandsArray, usage, coreInstance);
  }

  async checkProvider() {
    // ignore f -v / f -h / f create
    if (!this.commands.length || this.argv.h) {
      return;
    }
    const skipCommands = ['create', 'test'];
    if (skipCommands.indexOf(this.commands[0]) !== -1) {
      return;
    }
    if (!this.spec.provider) {
      this.spec.provider = { name: '', runtime: '' };
    }
    if (!this.spec.provider.name || this.argv.platform) {
      let platform = this.argv.platform;
      let needSelectPlatform = false;
      if (!this.spec.provider.name) {
        // 未标明哪个平台
        needSelectPlatform = true;
      } else if (this.argv.platform === true) {
        // 使用 f xxx --platform
        needSelectPlatform = true;
      }
      if (needSelectPlatform) {
        const prompt = new Select({
          name: 'provider',
          message: 'Which platform do you want to use?',
          choices: ['阿里云函数计算 aliyun fc', '腾讯云函数 tencent scf'],
        });
        const answers = await prompt.run();
        platform = answers.split(' ')[1];
      }
      if (typeof platform === 'string') {
        this.spec.provider.name = platform;
        saveYaml(getSpecFile(this.cwd).path, this.spec);
      }
    }
  }
}
