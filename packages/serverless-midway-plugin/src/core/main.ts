import { ProviderManager } from './providerManager';
import { IServerless, IServerlessOptions } from '../interface/midwayServerless';
import { transform } from '@midwayjs/spec-builder';
import { join } from 'path';
const coverAttributes = ['layers'];
export class MidwayServerless {

  serverless: IServerless;
  options: IServerlessOptions;

  constructor(serverless: IServerless, options: IServerlessOptions) {
    this.serverless = serverless;
    this.options = options;

    const serviceyml = transform(join(this.serverless.config.servicePath, 'serverless.yml'));
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
