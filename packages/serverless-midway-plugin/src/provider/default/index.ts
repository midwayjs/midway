import { ProviderBase } from '../../core/providerBase';
import { IServerlessOptions } from '../../interface/midwayServerless';
import { InvokePlugin } from '@midwayjs/fcli-plugin-invoke';
import { TestPlugin } from '@midwayjs/fcli-plugin-test';
import { Package } from './package';
import { Deploy } from './deploy';

class ProviderDefault extends ProviderBase {
  constructor(serverless: any, options: IServerlessOptions) {
    super(serverless, options);

    const config = this.bindCommand(
      {
        invoke: new InvokePlugin(serverless, options),
        package: new Package(this),
        deploy: new Deploy(this),
        test: new TestPlugin(serverless, options),
      },
      {
        package: ['deploy'],
      }
    );

    this.commands = config.commands;
    this.hooks = config.hooks;
  }
}

export default ProviderDefault;
