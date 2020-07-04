import { BasePlugin, ICoreInstance } from '@midwayjs/fcli-command-core';
import { join } from 'path';
export class AWSLambdaPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'aws';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  hooks = {
    'deploy:deploy': this.deploy.bind(this),
  };

  async deploy() {
    console.log('123');
  }
}
