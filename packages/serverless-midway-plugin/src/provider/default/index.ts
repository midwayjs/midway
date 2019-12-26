import { ProviderBase } from '../../core/providerBase';
import { IServerless, IServerlessOptions } from '../../interface/midwayServerless';
import { Invoke, Test } from '@midwayjs/faas-cli';
import { Package } from './package';
import { Deploy } from './deploy';
class ProviderDefault extends ProviderBase {

  constructor(serverless: IServerless, options: IServerlessOptions) {
    super(serverless, options);

    const config = this.bindCommand({
      invoke: new Invoke(serverless, options),
      package: new Package(this),
      deploy: new Deploy(this),
      test: new Test(serverless, options)
    }, {
      package: ['deploy']
    });

    this.commands = config.commands;
    this.hooks = config.hooks;

  }
}

export default ProviderDefault;
