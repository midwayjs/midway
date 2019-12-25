import { invoke as InvokeFun, InvokeClass } from '@midwayjs/faas-cli';
export const invoke = (options: {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string;       // debug 端口
  data?: any[];         // 函数入参
  nolog?: boolean;      // 是否不进行console输出
  trigger?: string;     // 触发器
  runtime?: string;     // 运行时环境
}) => {
  const { runtime, trigger } = options;

  let starter;
  let eventPath;
  let eventName;

  if (runtime === 'aliyun') {
    starter = require.resolve('@midwayjs/serverless-fc-starter');
    eventPath = require.resolve('@midwayjs/serverless-fc-trigger');
    if (trigger === 'http') {
      eventName = 'HTTPTrigger';
    } else if (trigger === 'apiGateway') {
      eventName = 'ApiGatewayTrigger';
    }
  } else if (runtime === 'tencent') {
    starter = require.resolve('@midwayjs/serverless-scf-starter');
  }

  return InvokeFun({
    ...options,
    starter,
    eventPath,
    eventName
  });
};
export class Invoke extends InvokeClass {
  commands: any;
  hooks: any;
  core: any;
  options: any;
  constructor(core, options) {
    super(core, options);

    this.commands.invoke.rank = 100;
    this.commands.invoke.lifecycleEvents = ['opensource'];
    const originHooks = this.hooks['invoke:invoke'];
    this.hooks = {
      'invoke:opensource': originHooks
    };
  }

  async invokeFun(func: string) {
    const providerName = this.core.service && this.core.service.provider && this.core.service.provider.name;
    const funcConf = this.core.service && this.core.service.functions  && this.core.service.functions[func];
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

    return invoke({
      runtime: providerName,
      functionName: func,
      debug: this.options.debug,
      data: this.options.data || '{}',
      trigger: this.options.trigger || eventResult[0]
    });
  }
}
