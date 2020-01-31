import { BaseCLI, getSpecFile } from '@midwayjs/fcli-command-core';
import { TestPlugin } from '@midwayjs/fcli-plugin-test';
import { InvokePlugin } from '@midwayjs/fcli-plugin-invoke';
import { PackagePlugin } from '@midwayjs/fcli-plugin-package';
import { DeployPlugin } from '@midwayjs/fcli-plugin-deploy';
import { AliyunFCPlugin } from '@midwayjs/fcli-plugin-fc';
import { CreatePlugin } from '@midwayjs/fcli-plugin-create';
import { saveYaml } from '@midwayjs/serverless-spec-builder';
const { Select } = require('enquirer');
export class CLI extends BaseCLI {
  loadDefaultPlugin() {
    this.core.addPlugin(CreatePlugin);
    this.core.addPlugin(InvokePlugin);
    this.core.addPlugin(TestPlugin);
    this.core.addPlugin(PackagePlugin);
    this.core.addPlugin(DeployPlugin);
    this.core.addPlugin(AliyunFCPlugin);
  }

  async loadPlugins() {
    await this.checkProvider();
    await super.loadPlugins();
  }

  async checkProvider() {
    if (!this.spec.provider) {
      this.spec.provider = { name: '', runtime: '' };
    }
    if (!this.spec.provider.name || this.argv.platform) {
      let platform = this.argv.platform;
      let needSelectPlatform = false;
      if (!this.spec.provider.name) { // 未标明哪个平台
        needSelectPlatform = true;
      } else if (this.argv.platform === true) { // 使用 f xxx --platform
        needSelectPlatform = true;
      }
      if (needSelectPlatform) {
        const prompt = new Select({
          name: 'provider',
          message: 'Which platform do you want to use?',
          choices: ['阿里云函数计算 aliyun fc', '腾讯云函数 tencent scf']
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
