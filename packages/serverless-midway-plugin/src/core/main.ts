import { ProviderManager } from './providerManager';
import { IServerless, IServerlessOptions } from '../interface/midwayServerless';
import { transform, saveYaml } from '@midwayjs/spec-builder';
import { join } from 'path';
const { Select } = require('enquirer');
const coverAttributes = ['layers'];
export class MidwayServerless {

  serverless: IServerless;
  options: IServerlessOptions;

  constructor(serverless: IServerless, options: IServerlessOptions) {
    this.serverless = serverless;
    this.options = options;
  }

  async asyncInit() {
    const yamlFile = join(this.serverless.config.servicePath, 'serverless.yml');
    const serviceyml = transform(yamlFile);

    if (!this.serverless.service.provider) {
      this.serverless.service.provider = serviceyml.provider = { name: '', runtime: '' };
    }

    if (!this.serverless.service.provider.name) {
      const prompt = new Select({
        name: 'provider',
        message: 'Which platform do you want to use?',
        choices: ['阿里云函数计算 aliyun fc', '腾讯云函数 tencent scf']
      });
      const answers = await prompt.run();
      const platform = answers.split(' ')[1];
      serviceyml.provider.name = platform;
      this.serverless.service.provider.name = platform;
      this.serverless.pluginManager.serverlessConfigFile.provider.name = platform;
      saveYaml(yamlFile, serviceyml);
    }

    coverAttributes.forEach((attr: string) => {
      if (serviceyml[attr]) {
        this.serverless.service[attr] = serviceyml[attr];
      }
    });

    ProviderManager.call(this);

    this.serverless.pluginManager.commands.deploy.lifecycleEvents = [
      'midway-deploy',
    ];
  }
}
