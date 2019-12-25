import { CommandBase, ICommand, IHooks } from '../../core/commandBase';
import { invoke } from '@midwayjs/invoke';

export class Invoke extends CommandBase {

  serverless: any;

  getCommand(): ICommand {
    return {
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
  }

  getHooks(): IHooks {
    return {
      'invoke:invoke': async () => {
        if (this.options.remote) {
          return;
        }
        const func = this.options.function;
        const providerName = this.serverless.service && this.serverless.service.provider && this.serverless.service.provider.name;
        const funcConf = this.serverless.service && this.serverless.service.functions  && this.serverless.service.functions[func];
        let eventResult = [];
        if (funcConf) {
          const events = funcConf.events;
          if (Array.isArray(events)) {
            let eventKey = [];
            for (const evt of events) {
              eventKey = eventKey.concat(Object.keys(evt));
            }
            eventResult = eventKey;
          }
        }

        this.serverless.cli.log(` - Invoke ${func}`);

        const result = await invoke({
          runtime: providerName,
          functionName: func,
          debug: this.options.debug,
          data: this.options.data || '{}',
          trigger: this.options.trigger || eventResult[0]
        });
        this.serverless.cli.log('--------- result start --------');
        this.serverless.cli.log(JSON.stringify(result));
        this.serverless.cli.log('--------- result end --------');
      }
    };
  }
}
