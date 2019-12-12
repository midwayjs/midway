import { ProviderBase } from '../../core/providerBase';
import MidwayServerless from '../../core/serverless';
import * as Tencent from 'serverless-tencent-scf';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '@midwayjs/serverless-scf-spec';
import { join } from 'path';
import { wrapperContent } from './wrapper';

class ProviderTencent extends ProviderBase {

  midwayBuildPath: string;

  constructor(serverless: any, options: any) {
    super(serverless, options);
    this.provider = 'tencent';

    this.hooks = {
      'package:midway-spec': async () => {
        await generateFunctionsSpecFile(this.getSpecJson({
          provider: {
            stage: 'test'
          }
        }), join(this.midwayBuildPath, 'serverless.yml'));
      },
      'package:midway-wrapper': async () => {
        this.setGolbalDependencies('@midwayjs/serverless-scf-starter');
        this.loadWrapper(wrapperContent);
      },
      'deploy:midway-deploy': async () => {
        const tencentServerless = await this.getTencentServerless();
        if (!this.serverless.service.package) {
          this.serverless.service.package = {};
          if (!this.serverless.service.package.artifact) {
            this.serverless.service.package.artifact = 'artifact.zip';
          }
        }
        const artifact = this.serverless.service.package.artifact.split('/').pop();
        // 添加构建逻辑
        const hooks = tencentServerless.pluginManager.hooks;
        if (!hooks['package:compileFunctions']) {
          hooks['package:compileFunctions'] = [];
        }
        hooks['package:compileFunctions'].push({
          pluginName: 'ProviderTencent',
          hook: async () => {
            // 进行构建
            // 执行 package 打包
            await this.callCommand('package', {
              ...this.options,
              package: `.serverless/${artifact}`
            });
          },
        });
        // 修改打包文件
        if (!tencentServerless.service.package) {
          tencentServerless.service.package = {};
        }
        tencentServerless.service.package.artifact = `.serverless/${artifact}`;

        await tencentServerless.pluginManager.invoke.call(tencentServerless.pluginManager, ['deploy'], true);
        this.serverless.cli.log('deploy tencent success');
      },
    };
  }

  async getTencentServerless() {
    const midwayServerless: any = new MidwayServerless({
      providerName: this.provider,
    });
    midwayServerless.setProvider.call(midwayServerless, this.provider, midwayServerless);
    await midwayServerless.init();
    await midwayServerless.run();

    Object.assign(
      midwayServerless.service,
      {
        package: {},
        runtimeExtensions: {}
      },
      await generateFunctionsSpec(this.getSpecJson({
        provider: {
          stage: 'test'
        }
      }))
    );

    midwayServerless.pluginManager.addPlugin(Tencent);
    return midwayServerless;
  }
}

export default ProviderTencent;
