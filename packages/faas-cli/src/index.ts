import { BaseCLI, installNpm } from '@midwayjs/fcli-command-core';
import { saveYaml } from '@midwayjs/serverless-spec-builder';
import { plugins } from './plugins';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import Spin from 'light-spinner';

const { Select } = require('enquirer');
export class CLI extends BaseCLI {
  async loadDefaultPlugin() {
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
    const platform = this.spec.provider.name;
    const requiredMap = {};
    for (let pluginIndex = 0; pluginIndex < needLoad.length; pluginIndex++) {
      const pluginInfo = needLoad[pluginIndex];
      const key = `${pluginInfo.mod}:${pluginInfo.name}`;
      // skip unneed plugin
      if (
        requiredMap[key] ||
        (pluginInfo.platform && platform !== pluginInfo.platform)
      ) {
        continue;
      }
      requiredMap[key] = true;
      let mod;
      try {
        mod = require(pluginInfo.mod);
      } catch (e) {
        const userModPath = resolve(this.cwd, 'node_modules', pluginInfo.mod);
        // if plugin not exists, auto install
        if (!existsSync(userModPath)) {
          await this.autoInstallMod(pluginInfo.mod);
        }
        try {
          mod = require(userModPath);
        } catch (e) {
          // no oth doing
        }
      }
      if (mod && mod[pluginInfo.name]) {
        this.core.addPlugin(mod[pluginInfo.name]);
      }
    }
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
      const nodeVersion = execSync('node -v').toString().replace('\n', '');
      log.log('Node.js'.padEnd(20) + nodeVersion);
    } catch (E) {
      /** ignore */
    }

    try {
      // midway-faas version
      const cliVersion = require('../package.json').version;
      log.log('@midwayjs/faas-cli'.padEnd(20) + `v${cliVersion}`);
    } catch (E) {
      /** ignore */
    }
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
          choices: [
            '阿里云函数计算 aliyun fc',
            '腾讯云函数 tencent scf',
            '亚马逊 aws lambda',
          ],
        });
        const answers = await prompt.run();
        platform = answers.split(' ')[1];
      }
      if (typeof platform === 'string') {
        this.spec.provider.name = platform;
        saveYaml(this.specFile.path, this.spec);
      }
    }
  }

  async autoInstallMod(modName) {
    const log = this.loadLog();
    log.log(
      `[ midway ] CLI plugin '${modName}' was not installed, and will be installed automatically`
    );
    if (!this.argv.npm) {
      log.log(
        '[ midway ] You could use the `--npm` parameter to speed up the installation process'
      );
    }
    const spin = new Spin({ text: 'installing' });
    spin.start();
    try {
      await installNpm({
        npmName: modName,
        register: this.argv.npm,
        baseDir: this.cwd,
        slience: true,
      });
    } catch (e) {
      log.error(
        `[ midway ] cli plugin '${modName}' install error: ${e?.message}`
      );
      log.log(`[ midway ] please manual install '${modName}'`);
    }
    spin.stop();
  }
}
