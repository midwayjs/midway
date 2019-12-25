import { ProviderBase } from '../../core/providerBase';
import { IServerless, IServerlessOptions } from '../../interface/midwayServerless';
import { Dev } from './dev';
import { Invoke } from '@midwayjs/invoke';
import { Package } from './package';
import { Test } from './test';
import { Deploy } from './deploy';
class ProviderDefault extends ProviderBase {

  constructor(serverless: IServerless, options: IServerlessOptions) {
    super(serverless, options);

    const config = this.bindCommand({
      dev: new Dev(this),
      invoke: new Invoke(serverless, options),
      package: new Package(this),
      deploy: new Deploy(this),
      test: new Test(this)
    }, {
      package: ['deploy']
    });

    this.commands = config.commands;
    this.hooks = config.hooks;

  }
}

export default ProviderDefault;
