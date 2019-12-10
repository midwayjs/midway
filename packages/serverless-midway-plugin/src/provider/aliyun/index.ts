import { ProviderBase } from '../../core/providerBase';
import { IServerless, IServerlessOptions } from '../../interface/midwayServerless';
import * as AliyunDeploy from '@alicloud/fun/lib/commands/deploy';
import * as AliyunConfig from '@alicloud/fun/lib/commands/config';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { generateFunctionsSpecFile } from '@midwayjs/serverless-fc-spec';
import { wrapperContent } from './wrapper';

class ProviderFc extends ProviderBase {

  constructor(serverless: IServerless, options: IServerlessOptions) {
    super(serverless, options);
    this.provider = 'aliyun';
    this.serverless.setProvider('aliyun', this);
    this.hooks = {
      'invoke:invoke': async () => { // fc invoke 的流程需要把入口文件创建出来，默认的ioc注入的是不固定入口是哪一个的

      },
      'package:midway-spec': async () => {
        await generateFunctionsSpecFile(join(this.servicePath, 'serverless.yml'), join(this.midwayBuildPath, 'template.yml'));
      },
      'package:midway-wrapper': async () => {
        this.loadWrapper(wrapperContent);
      },
      'deploy:midway-deploy': async () => {

        const profPath = join(homedir(), '.fcli/config.yaml');
        const isExists = existsSync(profPath);
        if (!isExists || this.options.resetConfig) {
          // aliyun config
          this.serverless.cli.log('please input aliyun config');
          await AliyunConfig();
        }

        // 执行 package 打包
        await this.callCommand('package', {
          ...this.options,
          skipZip: true // 跳过压缩成zip
        });
        this.serverless.cli.log('Start deploy by @alicloud/fun');
        try {
          await AliyunDeploy({
            template: join(this.midwayBuildPath, 'template.yml')
          });
          this.serverless.cli.log('deploy success');
        } catch (e) {
          this.serverless.cli.log(`deploy error: ${e.message}`);
        }
      },
    };
  }
}

export default ProviderFc;
