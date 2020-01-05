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
      this.core.cli.log(` - Invoke ${func}`);

      const result = await this.invokeFun(func);
      this.core.cli.log('--------- result start --------');
      this.core.cli.log(JSON.stringify(result));
      this.core.cli.log('--------- result end --------');
    },
  };

  async invokeFun(functionName: string) {
    const allFunctions = this.core.service.functions || {};
    const funcConf = allFunctions[functionName];
    const layersList = [{}, this.core.service.layers || {}];
    const providerName =
      this.core.service.provider && this.core.service.provider.name;
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

    const layers = Object.assign.apply({}, layersList);

    const eventOptions =
      this.getEventOptions(
        providerName,
        this.options.event || this.options.trigger || eventResult[0]
      ) || {};

    const options = {
      functionDir: this.core.config.servicePath,
      functionName,
      debug: this.options.debug,
      data: this.options.data || '{}',
      handler: funcConf.handler,
      layers,
      ...eventOptions,
    };
    return invoke(options);
  }

  // 获取触发器及starter配置
  getEventOptions(providerName?: string, eventName?: string) {
    return {
      starter: '',
      eventPath: '',
      eventName: '',
    };
  }
}
