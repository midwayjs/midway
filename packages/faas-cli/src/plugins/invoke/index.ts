import { invoke } from './main';
const BasePlugin = require('@midwayjs/command-core/dist/plugin');

export default class Invoke extends BasePlugin {

  constructor(core, options) {
    super(core, options);
  }

  commands = {
    invoke: {
      usage: '',
      lifecycleEvents: ['invoke'],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f'
        },
        data: {
          usage: 'function args',
          shortcut: 'd'
        },
        debug: {
          usage: 'debug function'
        },
        trigger: {
          usage: 'trigger name',
          shortcut: 't'
        }
      }
    }
  };

  hooks = {
    'invoke:invoke': async () => {
      if (this.options.remote) {
        return;
      }
      const func = this.options.function;
      this.core.cli.log(` - Invoke ${func}`);

      const result = await this.invokeFun(func);
      this.core.cli.log('--------- result start --------');
      this.core.cli.log(JSON.stringify(result));
      this.core.cli.log('--------- result end --------');
    }
  };

  async invokeFun(functionName: string) {
    const allFunctions = this.core.service.functions || {};
    const funcConf = allFunctions[functionName];
    const options = {
      functionDir: this.core.config.servicePath,
      functionName,
      debug: this.options.debug,
      data: this.options.data || '{}',
      handler: funcConf.handler
    };
    return invoke(options);
  }
}
