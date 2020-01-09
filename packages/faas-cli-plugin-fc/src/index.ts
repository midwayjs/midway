import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';
import * as AliyunDeploy from '@alicloud/fun/lib/commands/deploy';
import * as AliyunConfig from '@alicloud/fun/lib/commands/config';
import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, existsSync } from 'fs';
import { render } from 'ejs';
import { generateFunctionsSpecFile } from '@midwayjs/serverless-spec-builder/fc';
import { wrapperContent } from '@midwayjs/serverless-fc-starter';
import { formatLayers } from './utils';
export class AliyunFCPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'aliyun';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  hooks = {
    'package:spec': async () => {
      await generateFunctionsSpecFile(
        this.getSpecJson(),
        join(this.midwayBuildPath, 'template.yml')
      );
    },
    'package:wrapper': async () => {
      this.setGolbalDependencies('@midwayjs/serverless-fc-starter');
      this.loadWrapper(wrapperContent);
    },
    'deploy:deploy': async () => {
      this.core.cli.log('deploy');
      const profPath = join(homedir(), '.fcli/config.yaml');
      const isExists = existsSync(profPath);
      if (!isExists || this.options.resetConfig) {
        // aliyun config
        this.core.cli.log('please input aliyun config');
        await AliyunConfig();
      }

      // 执行 package 打包
      await this.core.invoke(['package'], true, {
        ...this.options,
        skipZip: true, // 跳过压缩成zip
      });
      this.core.cli.log('Start deploy by @alicloud/fun');
      try {
        await AliyunDeploy({
          template: join(this.midwayBuildPath, 'template.yml'),
        });
        this.core.cli.log('deploy success');
      } catch (e) {
        this.core.cli.log(`deploy error: ${e.message}`);
      }
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

  // 写入口
  async loadWrapper(WrapperContent: string) {
    const files = {};
    const functions = this.core.service.functions || {};
    for (const func in functions) {
      const handlerConf = functions[func];
      if (handlerConf._ignore) {
        continue;
      }
      const [handlerFileName, name] = handlerConf.handler.split('.');
      if (!files[handlerFileName]) {
        files[handlerFileName] = {
          handlers: [],
          originLayers: [],
        };
      }
      if (handlerConf.layers && handlerConf.layers.length) {
        files[handlerFileName].originLayers.push(handlerConf.layers);
      }
      // 高密度部署
      if (handlerConf._isAggregation && handlerConf.functions) {
        files[handlerFileName].handlers.push({
          name,
          handlers: handlerConf._handlers,
        });
      } else {
        files[handlerFileName].handlers.push({
          name,
          handler: handlerConf.handler,
        });
      }
    }

    for (const file in files) {
      const fileName = join(this.midwayBuildPath, `${file}.js`);
      const layers = this.getLayers(
        this.core.service.layers,
        ...files[file].originLayers
      );
      const content = this.writeCodeToFile(WrapperContent, {
        handlers: files[file].handlers,
        ...layers,
      });
      writeFileSync(fileName, content);
    }
  }

  // 写代码到入口
  private writeCodeToFile(WrapperContent, options) {
    return render(WrapperContent, options);
  }

  // 安装layer
  private getLayers(...layersList: any) {
    const layerTypeList = formatLayers(...layersList);
    const layerDeps = [];
    const layers = [];

    if (layerTypeList && layerTypeList.npm) {
      Object.keys(layerTypeList.npm).forEach((originName: string) => {
        const name = 'layer_' + originName;
        layerDeps.push({ name, path: layerTypeList.npm[originName] });
        layers.push(name);
      });
    }
    return {
      layerDeps,
      layers,
    };
  }

  // 设置全局依赖，在package的时候会读取
  setGolbalDependencies(name: string, version?: string) {
    if (!this.core.service.globalDependencies) {
      this.core.service.globalDependencies = {};
    }
    this.core.service.globalDependencies[name] = version || '*';
  }
}
