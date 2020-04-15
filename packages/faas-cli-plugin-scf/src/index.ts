import { BasePlugin, ICoreInstance, CommandHookCore } from '@midwayjs/fcli-command-core';
import { join } from 'path';
import * as Tencent from 'serverless-tencent-scf';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '@midwayjs/serverless-spec-builder/scf';

export class TencentSCFPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'tencent';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  hooks = {
    'package:generateSpec': async () => {
      this.core.cli.log('Generate spec file...');
      await generateFunctionsSpecFile(
        this.getSpecJson({
          provider: {
            stage: 'test',
          },
        }),
        join(this.midwayBuildPath, 'serverless.yml')
      );
    },
    'package:generateEntry': async () => {
      this.core.cli.log('Generate entry file...');
      this.setGlobalDependencies('@midwayjs/serverless-scf-starter');
      writeWrapper({
        baseDir: this.servicePath,
        service: this.core.service,
        distDir: this.midwayBuildPath,
        starter: '@midwayjs/serverless-scf-starter'
      });
    },
    'deploy:deploy': async () => {
      // 执行 package 打包
      if (!this.core.service.package) {
        this.core.service.package = {};
      }
      if (!this.core.service.package.artifact) {
        this.core.service.package.artifact = 'artifact.zip';
      }
      await this.core.invoke(['package'], true, this.options);
      const tencentDeploy = await this.getTencentServerless(this.core.service.package.artifact);
      await tencentDeploy.invoke();
    },
  };

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

  async getTencentServerless(artifact) {
    Object.assign(
      this.core.service,
      {
        package: {},
        runtimeExtensions: {},
      },
      await generateFunctionsSpec(
        this.getSpecJson({
          provider: {
            stage: 'test',
          },
        })
      )
    );
    const midwayServerless: any = new CommandHookCore({
      config: {
        servicePath: this.servicePath,
      },
      commands: ['deploy'],
      service: {
        ...this.core.service,
        plugins: [],
        getAllFunctions: () => {
          return Object.keys(this.core.service.functions);
        },
        getFunction: functionName => {
          return this.core.service.functions[functionName];
        },
        package: {
          artifact
        }
      },
      provider: this.provider,
      options: {
        package: `.serverless/${this.core.service.package.artifact}`,
      }
    });
    midwayServerless.cliCommands = ['deploy'];
    midwayServerless.addPlugin(class DeployPlugin extends BasePlugin {
      commands = {
        deploy: { lifecycleEvents: ['deploy'] }
      };
    });
    midwayServerless.addPlugin(Tencent);
    await midwayServerless.ready();
    return midwayServerless;
  }
}
