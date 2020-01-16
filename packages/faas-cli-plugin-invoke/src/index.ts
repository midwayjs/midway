import { BasePlugin } from '@midwayjs/fcli-command-core';
import { invoke } from '@midwayjs/serverless-invoke';

export class InvokePlugin extends BasePlugin {
  commands = {
    invoke: {
      usage: '',
      lifecycleEvents: ['invoke'],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f',
        },
        data: {
          usage: 'function args',
          shortcut: 'd',
        },
        debug: {
          usage: 'debug function',
        },
        trigger: {
          usage: 'trigger name',
          shortcut: 't',
        },
      },
    },
  };

  hooks = {
    'invoke:invoke': async () => {
      if (this.options.remote) {
        return;
      }
      const func = this.options.function;
      try {
        const result = await this.invokeFun(func);
        this.core.cli.log('--------- result start --------');
        this.core.cli.log('');
        this.core.cli.log(JSON.stringify(result));
        this.core.cli.log('');
        this.core.cli.log('--------- result end --------');
      } catch (e) {
        const errorLog = this.core.cli.error || this.core.cli.log;
        errorLog(e && e.message ? `[Error] ${e.message}` : e);
      }
    },
  };

  async invokeFun(functionName: string) {
    const allFunctions = this.core.service.functions || {};
    const funcConf = allFunctions[functionName];
    if (!funcConf) {
      throw new Error(`function '${functionName}' not exists!`);
    }
    this.core.cli.log(`- Invoke ${functionName}`);
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
