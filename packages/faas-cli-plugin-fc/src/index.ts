import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';
// import * as AliyunDeploy from '@alicloud/fun/lib/commands/deploy';
import * as AliyunConfig from '@alicloud/fun/lib/commands/config';
import * as AliyunROSClient from '@alicloud/ros-2019-09-10';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { generateFunctionsSpecFile } from '@midwayjs/serverless-spec-builder/fc';
import { AliyunROSClientOpts } from './interface';
export class AliyunFCPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'aliyun';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  hooks = {
    'package:generateSpec': async () => {
      this.core.cli.log('Generate spec file...');
      await generateFunctionsSpecFile(
        this.getSpecJson(),
        join(this.midwayBuildPath, 'template.yml')
      );
    },
    'package:generateEntry': async () => {
      this.core.cli.log('Generate entry file...');
      this.setGlobalDependencies('@midwayjs/serverless-fc-starter');
      writeWrapper({
        baseDir: this.servicePath,
        service: this.core.service,
        distDir: this.midwayBuildPath,
        starter: '@midwayjs/serverless-fc-starter',
      });
    },
    'deploy:deploy': async () => {
      const profPath = join(homedir(), '.fcli/config.yaml');
      const isExists = existsSync(profPath);
      if (!isExists || this.options.resetConfig) {
        // aliyun config
        this.core.cli.log('please input aliyun config');
        const res = await AliyunConfig();
        console.log('res', res)
      }

      // 执行 package 打包
      // await this.core.invoke(['package'], true, {
      //   ...this.options,
      //   skipZip: true, // 跳过压缩成zip
      // });
      this.core.cli.log('Start deploy by @alicloud/fun');
      try {
        await this.createStack();
        // await AliyunDeploy({
        //   template: join(this.midwayBuildPath, 'template.yml'),
        // });
        this.core.cli.log('deploy success');
      } catch (e) {
        this.core.cli.log(`deploy error: ${e.message}`);
      }
    },
  };

  async createStack() {
    const client = new AliyunROSClient({
      accessKeyId: 'LTAIealJdISAUePV',
      accessKeySecret: 'veu6jrDf13bF8bNJGWIeKZ0yi0xY5b',
      endpoint: 'https://1834461034413514.cn-hangzhou.fc.aliyuncs.com',
      apiVersion: '2016-08-15'
    } as AliyunROSClientOpts);
    try {
      const res = await client.createStack({
        RegionId: 'cn-hangzhou',
        StackName: 'my-test-stack',
        TimeoutInMinutes: 1,
      });
      console.log('res', res)
    } catch (err) {
      console.log('err', err)
    }
  }

  getSpecJson(coverOptions?: any) {
    const service = this.core.service;
    if (coverOptions) {
      Object.keys(coverOptions).forEach((key: string) => {
        if (!service[key]) {
          service[key] = {};
        }
        Object.assign(service[key], coverOptions[key]);
      });
    }
    return {
      custom: service.custom,
      service: service.service,
      provider: service.provider,
      functions: this.getNotIgnoreFunc(),
      resources: service.resources,
      package: service.package,
    };
  }

  // 获取没有忽略的方法（for 高密度部署）
  getNotIgnoreFunc() {
    const func = {};
    for (const funcName in this.core.service.functions) {
      const funcConf = this.core.service.functions[funcName];
      if (funcConf._ignore) {
        continue;
      }
      func[funcName] = funcConf;
    }
    return func;
  }

  // 设置全局依赖，在package的时候会读取
  setGlobalDependencies(name: string, version?: string) {
    if (!this.core.service.globalDependencies) {
      this.core.service.globalDependencies = {};
    }
    this.core.service.globalDependencies[name] = version || '*';
  }
}
