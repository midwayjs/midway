import { ProviderManager } from './providerManager';
import { IServerless, IServerlessOptions } from '../interface/midwayServerless';
import { transform, saveYaml } from '@midwayjs/spec-builder';
import { join } from 'path';
const { Select } = require('enquirer');
const coverAttributes = ['layers', 'aggregation'];
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

    this.assignAggregationToFunctions();

    ProviderManager.call(this);

    this.serverless.pluginManager.commands.deploy.lifecycleEvents = [
      'midway-deploy',
    ];
  }

  // 合并高密度部署
  assignAggregationToFunctions() {
    if (!this.serverless.service.aggregation || !this.serverless.service.functions) {
      return;
    }
    let filterFunc = [];
    for (const aggregationName in this.serverless.service.aggregation) {
      this.serverless.service.functions[`aggregation_${aggregationName}`] = this.serverless.service.aggregation[aggregationName];
      if (!this.serverless.service.functions[`aggregation_${aggregationName}`].events) {
        this.serverless.service.functions[`aggregation_${aggregationName}`].events = [];
      }
      // 忽略原始方法，不再单独进行部署
      if (!this.serverless.service.aggregation[aggregationName].deployOrigin) {
        filterFunc = filterFunc.concat(
          this.serverless.service.aggregation[aggregationName].functions || []
        );
      }
      if (!this.serverless.service.functions[`aggregation_${aggregationName}`].events.length) {
        this.serverless.service.functions[`aggregation_${aggregationName}`].events.push({ http: { method: 'get' }});
      }
    }

    for (const func in this.serverless.service.functions) {
      // 过滤掉，不进行构建以及部署
      if (filterFunc.indexOf(func) !== -1) {
        this.serverless.service.functions[func]._ignore = true;
      }
    }
  }
}
